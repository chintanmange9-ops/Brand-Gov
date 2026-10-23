const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash("demo123", 10);
  await prisma.user.upsert({ where: { email: "steward@demo.com" }, update: {}, create: { email: "steward@demo.com", password: pw, name: "Brand Steward", role: "steward" } });
  await prisma.user.upsert({ where: { email: "creator@demo.com" }, update: {}, create: { email: "creator@demo.com", password: pw, name: "Content Creator", role: "creator" } });
  await prisma.user.upsert({ where: { email: "reviewer@demo.com" }, update: {}, create: { email: "reviewer@demo.com", password: pw, name: "Reviewer", role: "reviewer" } });
  await prisma.user.upsert({ where: { email: "manager@demo.com" }, update: {}, create: { email: "manager@demo.com", password: pw, name: "Manager", role: "manager" } });
  await prisma.user.upsert({ where: { email: "admin@demo.com" }, update: {}, create: { email: "admin@demo.com", password: pw, name: "Admin", role: "admin" } });

  await prisma.brandGuideline.createMany({ skipDuplicates: true, data: [
    { orgId: "default", title: "Tone", category: "tone", content: "Use a professional, concise, helpful tone. Avoid hype and unverified superlatives." },
    { orgId: "default", title: "Messaging", category: "messaging", content: "Do not make unsupported claims like 'fastest' or 'best'. Only use approved facts." },
    { orgId: "default", title: "Accessibility", category: "accessibility", content: "Every image must have descriptive alt text. Body text contrast must meet WCAG AA." },
  ] });
  await prisma.approvedFact.createMany({ skipDuplicates: true, data: [
    { orgId: "default", statement: "BrandGuard AI reviews content before publication.", source: "Product docs" },
    { orgId: "default", statement: "Supports text, PDF, DOCX and image formats.", source: "Product docs" },
  ] });
  await prisma.terminology.createMany({ skipDuplicates: true, data: [
    { orgId: "default", term: "AI", preferred: "AI", avoid: "artificial intelligence (use AI)", note: "Use 'AI' consistently." },
    { orgId: "default", term: "brand kit", preferred: "brand kit", avoid: "brand guidelines (deprecated)", note: "Use 'brand kit'." },
  ] });
  await prisma.asset.createMany({ skipDuplicates: true, data: [
    { orgId: "default", name: "Logo primary", type: "logo", url: "https://example.com/logo.png", metadata: "alt: BrandGuard AI logo; dims 200x60" },
  ] });

  console.log("Seeded. Users: admin@demo.com, steward@demo.com, manager@demo.com, reviewer@demo.com, creator@demo.com (password: demo123)");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
