import { NextResponse } from "next/server";
import { revokeCurrentSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/security";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ success: false, message: "Request origin is not allowed." }, { status: 403 });
  }
  await revokeCurrentSession();
  const response = NextResponse.json({ success: true });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), expires: new Date(0), maxAge: 0 });
  return response;
}
