import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, roleGuard, REVIEW_ROLES } from "@/lib/auth";

const VALID_DECISIONS = ["approve", "request_changes", "reject"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only reviewer roles may make review decisions
  const guard = roleGuard(user, REVIEW_ROLES);
  if (guard) return guard;

  const { decision, comment } = await req.json();
  if (!VALID_DECISIONS.includes(decision)) {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  const item = await prisma.contentItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.orgId !== user.orgId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (item.status === "published") {
    return NextResponse.json({ error: "Content already published" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: { contentId: id, reviewerId: user.id, decision, comment },
  });
  const status =
    decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "changes_requested";
  await prisma.contentItem.update({ where: { id }, data: { status } });
  return NextResponse.json({ review });
}
