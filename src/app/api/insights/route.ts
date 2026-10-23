import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const issues = await prisma.issue.findMany({ where: { content: { orgId: user.orgId } } });
  const byCategory: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  for (const i of issues) {
    byCategory[i.category] = (byCategory[i.category] || 0) + 1;
    bySeverity[i.severity] = (bySeverity[i.severity] || 0) + 1;
  }
  const contents = await prisma.contentItem.count({ where: { orgId: user.orgId } });
  const published = await prisma.contentItem.count({ where: { orgId: user.orgId, status: "published" } });
  return NextResponse.json({ totalIssues: issues.length, byCategory, bySeverity, contents, published });
}
