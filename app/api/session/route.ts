import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  // Session discovery is a harmless UI probe. Protected APIs still return 401.
  return NextResponse.json(session);
}
