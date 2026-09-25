import { prisma } from "@/lib/prisma";
import { nextLoginFailure } from "@/lib/security";

export async function getLoginThrottle(keys: string[], now = new Date()) {
  const rows = await prisma.loginThrottle.findMany({ where: { keyHash: { in: keys } } });
  const blockedUntil = rows.reduce<Date | null>((latest, row) => {
    if (!row.blockedUntil || row.blockedUntil <= now) return latest;
    return !latest || row.blockedUntil > latest ? row.blockedUntil : latest;
  }, null);
  return {
    blocked: Boolean(blockedUntil),
    retryAfterSeconds: blockedUntil ? Math.max(1, Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000)) : 0,
  };
}

export async function recordLoginFailure(keys: string[], now = new Date()) {
  for (const keyHash of keys) {
    const existing = await prisma.loginThrottle.findUnique({ where: { keyHash } });
    const next = nextLoginFailure(existing, now);
    await prisma.loginThrottle.upsert({
      where: { keyHash },
      create: { keyHash, ...next },
      update: next,
    });
  }
}

export async function clearLoginFailures(keys: string[]) {
  await prisma.loginThrottle.deleteMany({ where: { keyHash: { in: keys } } });
}
