import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await prisma.contentItem.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true, email: true } },
      issues: true,
      comments: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
      reviews: { include: { reviewer: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      revisions: { orderBy: { version: "desc" } },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.orgId !== user.orgId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ item });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await prisma.contentItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.orgId !== user.orgId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { body, title } = await req.json();

  // Drafting/editing is the creator's job; status is server-controlled
  // (transitions happen only via submit/review/publish endpoints).
  if (item.creatorId !== user.id) {
    return NextResponse.json(
      { error: "Only the content creator can edit this item" },
      { status: 403 }
    );
  }
  if (["published", "approved", "in_review", "submitted"].includes(item.status) && body !== undefined) {
    return NextResponse.json(
      { error: `Cannot edit body while status is '${item.status}'` },
      { status: 409 }
    );
  }

  const updated = await prisma.contentItem.update({
    where: { id },
    data: { ...(body !== undefined && { body }), ...(title && { title }) },
  });
  if (body !== undefined) {
    const last = await prisma.revision.findFirst({ where: { contentId: id }, orderBy: { version: "desc" } });
    await prisma.revision.create({
      data: { contentId: id, version: (last?.version || 0) + 1, body, authorId: user.id },
    });
  }
  return NextResponse.json({ item: updated });
}
