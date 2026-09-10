import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

export type Session = { id: number; name: string; role: Role; storeId: number | null; region: string | null };
export const SESSION_COOKIE = "retail_session";

export function encodeSession(session: Session) {
  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

export async function getSession(): Promise<Session | null> {
  try {
    const value = (await cookies()).get(SESSION_COOKIE)?.value;
    return value ? (JSON.parse(Buffer.from(value, "base64url").toString()) as Session) : null;
  } catch {
    return null;
  }
}

export function canAccessStore(session: Session, storeId: number, storeRegion?: string) {
  if (session.role === "EXECUTIVE") return true;
  if (session.role === "STORE_MANAGER") return session.storeId === storeId;
  return Boolean(session.region && storeRegion && session.region === storeRegion);
}
