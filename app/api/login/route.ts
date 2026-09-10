import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { encodeSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ success: false, message: "Email and password are required." }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (!user || !(await bcrypt.compare(String(password), user.password))) {
      return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
    }
    const session = { id: user.id, name: user.name, role: user.role, storeId: user.storeId, region: user.region };
    const response = NextResponse.json({ success: true, user: session });
    response.cookies.set(SESSION_COOKIE, encodeSession(session), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Unable to sign in right now. Please try again." }, { status: 500 });
  }
}
