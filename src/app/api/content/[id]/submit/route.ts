import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { runReview } from "@/lib/review";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await prisma.contentItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.orgId !== user.orgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (item.status === "published") {
    return NextResponse.json({ error: "Content already published" }, { status: 409 });
  }

  try {
    const findings = await runReview(id);
    return NextResponse.json({ findings });
  } catch (e: any) {
    console.error("Review failed:", e);
    return NextResponse.json({ error: "Review failed" }, { status: 500 });
  }
}
