import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { extractText, safeFileName, UPLOAD_DIR } from "@/lib/parse";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.contentItem.findMany({
    where: { orgId: user.orgId },
    orderBy: { updatedAt: "desc" },
    include: { creator: { select: { name: true } }, _count: { select: { issues: true } } },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const title = String(form.get("title") || "Untitled");
  const type = String(form.get("type") || "text");
  const body = String(form.get("body") || "");
  const file = form.get("file") as File | null;

  let filePath: string | null = null;
  let extracted = body;

  if (file && file.size > 0) {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const fname = `${Date.now()}_${safeFileName(file.name)}`;
    const dest = path.join(UPLOAD_DIR, fname);
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(dest, buf);
    filePath = dest;
    try {
      extracted = await extractText(dest, file.type || "text/plain");
      if (!extracted.trim()) extracted = body;
    } catch (e) {
      extracted = body || `(could not parse file: ${file.name})`;
    }
  }

  const item = await prisma.contentItem.create({
    data: { orgId: user.orgId, creatorId: user.id, title, type, body: extracted, filePath },
  });
  return NextResponse.json({ item });
}
