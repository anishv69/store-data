import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getInsuranceDashboard, InsuranceValidationError, parseInsuranceFilters } from "@/lib/insurance";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  if (session.role !== "EXECUTIVE") {
    return NextResponse.json({ message: "Executive access is required." }, { status: 403 });
  }

  try {
    const filters = parseInsuranceFilters(new URL(request.url).searchParams);
    return NextResponse.json(await getInsuranceDashboard(filters));
  } catch (error) {
    if (error instanceof InsuranceValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error("[insurance] Portfolio query failed", { userId: session.id, error });
    return NextResponse.json({ message: "Unable to load the insurance portfolio right now." }, { status: 500 });
  }
}
