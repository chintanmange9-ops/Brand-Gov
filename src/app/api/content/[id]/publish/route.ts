import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, roleGuard, PUBLISH_ROLES } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only manager+ may publish
  const guard = roleGuard(user, PUBLISH_ROLES);
  if (guard) return guard;

  const item = await prisma.contentItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.orgId !== user.orgId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (item.status !== "approved") {
    return NextResponse.json(
      { error: "Only approved content can be published" },
      { status: 409 }
    );
  }

  const published = await prisma.contentItem.update({
    where: { id },
    data: { status: "published" },
  });
  return NextResponse.json({ item: published });
}
