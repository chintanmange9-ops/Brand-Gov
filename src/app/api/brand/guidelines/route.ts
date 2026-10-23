import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, roleGuard, BRAND_ADMIN_ROLES } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.brandGuideline.findMany({ where: { orgId: user.orgId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const guard = roleGuard(user, BRAND_ADMIN_ROLES);
  if (guard) return guard;
  const { title, category, content } = await req.json();
  const item = await prisma.brandGuideline.create({ data: { orgId: user.orgId, title, category, content } });
  return NextResponse.json({ item });
}
