import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRegionalDashboard } from "@/lib/dashboard";

export async function GET(_: Request, { params }: { params: Promise<{ region: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  if (session.role !== "REGIONAL_MANAGER") return NextResponse.json({ message: "Regional manager access is required." }, { status: 403 });
  const region = decodeURIComponent((await params).region);
  if (session.region !== region) return NextResponse.json({ message: "You do not have access to this region." }, { status: 403 });
  return NextResponse.json(await getRegionalDashboard(region));
}
