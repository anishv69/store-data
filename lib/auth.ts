import { cookies } from "next/headers";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createOpaqueToken, hashSecret, SESSION_MAX_AGE_SECONDS, sessionExpiration } from "@/lib/security";

export type Session = { id: number; name: string; role: Role; storeId: number | null; region: string | null };
export const SESSION_COOKIE = "retail_session";

export function sessionCookieOptions(expiresAt?: Date) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    ...(expiresAt ? { expires: expiresAt } : {}),
  };
}

export async function createSession(userId: number) {
  const token = createOpaqueToken();
  const expiresAt = sessionExpiration();
  await prisma.$transaction([
    prisma.authSession.deleteMany({ where: { expiresAt: { lte: new Date() } } }),
    prisma.authSession.create({ data: { tokenHash: hashSecret(token), userId, expiresAt } }),
  ]);
  return { token, expiresAt };
}

export async function getSession(): Promise<Session | null> {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token || token.length < 40 || token.length > 128) return null;
    const record = await prisma.authSession.findUnique({
      where: { tokenHash: hashSecret(token) },
      include: { user: true },
    });
    if (!record) return null;
    if (record.expiresAt <= new Date()) {
      await prisma.authSession.delete({ where: { id: record.id } }).catch(() => undefined);
      return null;
    }
    return {
      id: record.user.id,
      name: record.user.name,
      role: record.user.role,
      storeId: record.user.storeId,
      region: record.user.region,
    };
  } catch {
    return null;
  }
}

export async function revokeCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return;
  await prisma.authSession.deleteMany({ where: { tokenHash: hashSecret(token) } });
}

export function canAccessStore(session: Session, storeId: number, storeRegion?: string) {
  if (session.role === "EXECUTIVE") return true;
  if (session.role === "STORE_MANAGER") return session.storeId === storeId;
  return Boolean(session.region && storeRegion && session.region === storeRegion);
}
