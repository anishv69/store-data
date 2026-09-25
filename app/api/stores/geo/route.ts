import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStoreGeoData } from "@/lib/store-geo";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  if (session.role !== "EXECUTIVE") {
    return NextResponse.json({ message: "Executive access is required." }, { status: 403 });
  }

  try {
    return NextResponse.json(await getStoreGeoData());
  } catch (error) {
    console.error("[store-geo] Map query failed", { userId: session.id, error });
    return NextResponse.json({ message: "Unable to load store geography right now." }, { status: 500 });
  }
}
