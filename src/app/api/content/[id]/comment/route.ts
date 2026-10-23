import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await prisma.contentItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.orgId !== user.orgId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { text } = await req.json();
  const comment = await prisma.comment.create({
    data: { contentId: id, authorId: user.id, text },
    include: { author: { select: { name: true } } },
  });
  return NextResponse.json({ comment });
}
