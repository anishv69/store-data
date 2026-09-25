import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { clearLoginFailures, getLoginThrottle, recordLoginFailure } from "@/lib/login-throttle";
import { prisma } from "@/lib/prisma";
import { isSameOriginRequest, LoginValidationError, loginThrottleKeys, parseLoginCredentials } from "@/lib/security";

const DUMMY_PASSWORD_HASH = "$2b$10$War7ODvG4BCFH/mFaRJg0OVRRMS2HUEdUqjE0klj9b/LQ4IPPYxHa";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ success: false, message: "Request origin is not allowed." }, { status: 403 });
  }

  try {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      throw new LoginValidationError("A valid JSON request body is required.");
    }
    const { email, password } = parseLoginCredentials(payload);
    const throttleKeys = loginThrottleKeys(request, email);
    const throttle = await getLoginThrottle(throttleKeys);
    if (throttle.blocked) {
      return NextResponse.json(
        { success: false, message: "Too many sign-in attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(throttle.retryAfterSeconds) } },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const passwordMatches = await bcrypt.compare(password, user?.password ?? DUMMY_PASSWORD_HASH);
    if (!user || !passwordMatches) {
      await recordLoginFailure(throttleKeys);
      console.warn("[auth] Sign-in rejected", { client: throttleKeys[0].slice(0, 12) });
      return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
    }

    await clearLoginFailures(throttleKeys);
    const { token, expiresAt } = await createSession(user.id);
    const session = { id: user.id, name: user.name, role: user.role, storeId: user.storeId, region: user.region };
    const response = NextResponse.json({ success: true, user: session });
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
    return response;
  } catch (error) {
    if (error instanceof LoginValidationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error("[auth] Sign-in failed", error);
    return NextResponse.json({ success: false, message: "Unable to sign in right now. Please try again." }, { status: 500 });
  }
}
