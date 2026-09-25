import assert from "node:assert/strict";
import test from "node:test";
import {
  createOpaqueToken,
  hashSecret,
  isSameOriginRequest,
  LoginValidationError,
  loginThrottleKeys,
  MAX_LOGIN_FAILURES,
  nextLoginFailure,
  parseLoginCredentials,
  SESSION_MAX_AGE_SECONDS,
  sessionExpiration,
} from "../lib/security";

test("creates unique opaque session tokens and deterministic hashes", () => {
  const first = createOpaqueToken();
  const second = createOpaqueToken();
  assert.notEqual(first, second);
  assert.match(first, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(hashSecret(first), hashSecret(first));
  assert.notEqual(hashSecret(first), first);
  assert.match(hashSecret(first), /^[a-f0-9]{64}$/);
});

test("normalizes valid login credentials", () => {
  assert.deepEqual(parseLoginCredentials({ email: " CFO@Apple.Demo ", password: "password123" }), {
    email: "cfo@apple.demo",
    password: "password123",
  });
});

test("rejects malformed login credentials", () => {
  assert.throws(() => parseLoginCredentials(null), LoginValidationError);
  assert.throws(() => parseLoginCredentials({ email: "not-an-email", password: "x" }), LoginValidationError);
  assert.throws(() => parseLoginCredentials({ email: "a@example.com", password: "x".repeat(257) }), LoginValidationError);
});

test("creates an eight-hour session expiration", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");
  assert.equal(sessionExpiration(now).getTime() - now.getTime(), SESSION_MAX_AGE_SECONDS * 1000);
});

test("builds private throttle identifiers for both client and account", () => {
  const request = new Request("https://example.com/api/login", { headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" } });
  const keys = loginThrottleKeys(request, "cfo@apple.demo");
  assert.equal(keys.length, 2);
  assert.notEqual(keys[0], keys[1]);
  assert.ok(keys.every((key) => /^[a-f0-9]{64}$/.test(key)));
  assert.equal(keys.join("").includes("203.0.113.10"), false);
});

test("blocks the fifth failed login and resets an expired window", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");
  const blocked = nextLoginFailure({ failedCount: MAX_LOGIN_FAILURES - 1, windowStartedAt: now }, now);
  assert.equal(blocked.failedCount, MAX_LOGIN_FAILURES);
  assert.ok(blocked.blockedUntil && blocked.blockedUntil > now);

  const later = new Date("2026-01-01T00:16:00.000Z");
  const reset = nextLoginFailure({ failedCount: 4, windowStartedAt: now }, later);
  assert.equal(reset.failedCount, 1);
  assert.equal(reset.blockedUntil, null);
  assert.equal(reset.windowStartedAt, later);
});

test("rejects cross-origin state-changing requests", () => {
  assert.equal(isSameOriginRequest(new Request("https://app.example.com/api/login")), true);
  assert.equal(isSameOriginRequest(new Request("https://app.example.com/api/login", { headers: { origin: "https://app.example.com" } })), true);
  assert.equal(isSameOriginRequest(new Request("https://app.example.com/api/login", { headers: { origin: "https://evil.example" } })), false);
});
