import { prisma } from "./prisma";
import { groq, MODEL } from "./groq";

/** Stable key for matching findings across re-reviews. */
function issueKey(category: string, flaggedText: string | null) {
  return `${category}::${(flaggedText ?? "").trim().toLowerCase()}`;
}

export async function buildBrandContext(orgId: string) {
  const [guidelines, facts, terms, assets] = await Promise.all([
    prisma.brandGuideline.findMany({ where: { orgId } }),
    prisma.approvedFact.findMany({ where: { orgId } }),
    prisma.terminology.findMany({ where: { orgId } }),
    prisma.asset.findMany({ where: { orgId } }),
  ]);
  return { guidelines, facts, terms, assets };
}

export async function runReview(contentId: string) {
  const content = await prisma.contentItem.findUnique({ where: { id: contentId } });
  if (!content) throw new Error("Content not found");
  const ctx = await buildBrandContext(content.orgId);

  const prompt = `You are a brand-governance reviewer. Review the content against the brand kit and return ONLY a JSON array of findings. Each finding must follow this schema: { "category": "tone|terminology|messaging|visual|accessibility|claim", "severity": "critical|major|minor|suggestion", "location": "string", "flagged_text": "string", "explanation": "string", "source_ref": "string", "suggested_fix": "string", "confidence": 0.0 }.

Brand kit:
GUIDELINES: ${JSON.stringify(ctx.guidelines.map(g => ({ title: g.title, category: g.category, content: g.content })))}
APPROVED FACTS: ${JSON.stringify(ctx.facts.map(f => ({ statement: f.statement, source: f.source })))}
TERMINOLOGY: ${JSON.stringify(ctx.terms.map(t => ({ term: t.term, preferred: t.preferred, avoid: t.avoid, note: t.note })))}
ASSETS: ${JSON.stringify(ctx.assets.map(a => ({ name: a.name, type: a.type, metadata: a.metadata })))}

Content to review:
TITLE: ${content.title}
BODY: ${content.body || "(see attached file)"}

Rules:
- Only flag issues supported by the brand kit. Do not invent rules.
- For images/visuals, check alt text, dimensions, format hints if provided.
- For claims, verify against approved facts; flag unsupported superlatives.
- suggested_fix must preserve the creator's intent and voice.
- Return an empty array [] if no issues.
- Return ONLY valid JSON, no markdown fences.`;

  const res = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 4000,
  });

  const raw = res.choices[0]?.message?.content?.trim() || "[]";
  // strip markdown fences if present
  let jsonStr = raw;
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) jsonStr = fence[1].trim();
  if (!jsonStr.startsWith("[")) {
    const m = jsonStr.match(/\[[\s\S]*\]/);
    if (m) jsonStr = m[0];
  }

  let findings: any[] = [];
  try {
    findings = JSON.parse(jsonStr);
    if (!Array.isArray(findings)) findings = [];
  } catch {
    const idx = jsonStr.lastIndexOf("}");
    if (idx > 0) {
      try {
        findings = JSON.parse(jsonStr.slice(0, idx + 1) + "]");
        if (!Array.isArray(findings)) findings = [];
      } catch {
        findings = [];
      }
    } else {
      findings = [];
    }
  }

  // Sync findings without losing human decisions: match new findings to
  // existing issues by (category, normalized flagged text). Matching issues
  // keep their id + status + dismissReason while explanation/fixes refresh;
  // findings that no longer appear are removed.
  const CATEGORY_VALUES = new Set(["tone", "terminology", "messaging", "visual", "accessibility", "claim"]);
  const SEVERITY_VALUES = new Set(["critical", "major", "minor", "suggestion"]);

  const existing = await prisma.issue.findMany({ where: { contentId } });
  const existingByKey = new Map(existing.map(i => [issueKey(i.category, i.flaggedText), i]));

  for (const f of findings) {
    const category = CATEGORY_VALUES.has(f.category) ? String(f.category) : "messaging";
    const severity = SEVERITY_VALUES.has(f.severity) ? String(f.severity) : "minor";
    const data = {
      contentId,
      category,
      severity,
      location: f.location ? String(f.location) : null,
      flaggedText: f.flagged_text ? String(f.flagged_text) : null,
      explanation: String(f.explanation || ""),
      sourceRef: f.source_ref ? String(f.source_ref) : null,
      suggestedFix: f.suggested_fix ? String(f.suggested_fix) : null,
      confidence: typeof f.confidence === "number" ? f.confidence : null,
    };
    const prior = existingByKey.get(issueKey(category, data.flaggedText));
    if (prior) {
      // Decision state (status/dismissReason) deliberately not overwritten.
      await prisma.issue.update({ where: { id: prior.id }, data: data });
    } else {
      await prisma.issue.create({ data });
    }
  }
  const incomingKeys = new Set(
    findings.map((f: any) => issueKey(CATEGORY_VALUES.has(f.category) ? String(f.category) : "messaging", f.flagged_text ? String(f.flagged_text) : null))
  );
  for (const e of existing) {
    if (!incomingKeys.has(issueKey(e.category, e.flaggedText))) {
      await prisma.issue.delete({ where: { id: e.id } });
    }
  }

  await prisma.contentItem.update({
    where: { id: contentId },
    data: { status: "in_review" },
  });

  return findings;
}
