import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const ISSUE_STATUSES = ["open", "resolved", "dismissed"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; issueId: string }> }) {
  const { id, issueId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status, dismissReason } = await req.json();
  if (!ISSUE_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const issue = await prisma.issue.findUnique({ where: { id: issueId }, include: { content: true } });
  if (!issue || issue.contentId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (issue.content.orgId !== user.orgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.issue.update({
    where: { id: issueId },
    data: { status, ...(status === "dismissed" && dismissReason && { dismissReason }) },
  });
  return NextResponse.json({ issue: updated });
}
