import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Role permissions
export const REVIEW_ROLES = ["reviewer", "manager", "steward", "admin"];
export const PUBLISH_ROLES = ["manager", "steward", "admin"];
export const BRAND_ADMIN_ROLES = ["steward", "admin"];

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");
const COOKIE = "bg_session";

export async function hashPassword(p: string) {
  return bcrypt.hash(p, 10);
}
export async function verifyPassword(p: string, h: string) {
  return bcrypt.compare(p, h);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function getCurrentUser() {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as string;
    return prisma.user.findUnique({ where: { id: userId } });
  } catch {
    return null;
  }
}

/**
 * Returns a 403 NextResponse when `user` lacks one of the allowed roles,
 * or null when the user is allowed to proceed.
 */
export function roleGuard(
  user: { role?: string } | null | undefined,
  roles: string[]
): NextResponse | null {
  if (!user || !user.role || !roles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
