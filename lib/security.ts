import { createHash, randomBytes } from "node:crypto";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_BLOCK_MS = 15 * 60 * 1000;
export const MAX_LOGIN_FAILURES = 5;

export class LoginValidationError extends Error {}

export type LoginCredentials = { email: string; password: string };
export type LoginFailureRecord = { failedCount: number; windowStartedAt: Date };

export function createOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function sessionExpiration(from = new Date()) {
  return new Date(from.getTime() + SESSION_MAX_AGE_SECONDS * 1000);
}

export function parseLoginCredentials(value: unknown): LoginCredentials {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new LoginValidationError("Email and password are required.");
  }
  const input = value as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (!email || !password) throw new LoginValidationError("Email and password are required.");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new LoginValidationError("Enter a valid email address.");
  }
  if (password.length > 256) throw new LoginValidationError("Password is too long.");
  return { email, password };
}

export function requestClientAddress(request: Request) {
  return (request.headers.get("x-forwarded-for")?.split(",")[0]
    ?? request.headers.get("x-real-ip")
    ?? "unknown").trim().slice(0, 128);
}

export function loginThrottleKeys(request: Request, email: string) {
  const address = requestClientAddress(request);
  return [hashSecret(`address:${address}`), hashSecret(`account:${email}`)];
}

export function nextLoginFailure(existing: LoginFailureRecord | null, now = new Date()) {
  const windowExpired = !existing || existing.windowStartedAt.getTime() + LOGIN_WINDOW_MS <= now.getTime();
  const failedCount = windowExpired ? 1 : existing.failedCount + 1;
  return {
    failedCount,
    windowStartedAt: windowExpired ? now : existing.windowStartedAt,
    blockedUntil: failedCount >= MAX_LOGIN_FAILURES ? new Date(now.getTime() + LOGIN_BLOCK_MS) : null,
  };
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
