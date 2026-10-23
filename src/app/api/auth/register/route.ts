import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email in use" }, { status: 400 });
  // Open self-registration is creator-only; reviewer/manager/steward/admin
  // accounts are provisioned by seed (brand-kit admins), never via the API.
  const user = await prisma.user.create({
    data: { email, password: await hashPassword(password), name, role: "creator" },
  });
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
