import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  AggregationNotFoundError,
  AggregationValidationError,
  getSalesAggregation,
  parseAggregationFilters,
  type AggregationScope,
} from "@/lib/aggregations";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });

  let scope: AggregationScope = {};
  if (session.role === "REGIONAL_MANAGER") {
    if (!session.region) return NextResponse.json({ message: "No region is assigned to this account." }, { status: 403 });
    scope = { region: session.region };
  }
  if (session.role === "STORE_MANAGER") {
    if (!session.storeId) return NextResponse.json({ message: "No store is assigned to this account." }, { status: 403 });
    scope = { storeId: session.storeId };
  }

  try {
    const filters = parseAggregationFilters(new URL(request.url).searchParams);
    return NextResponse.json(await getSalesAggregation(filters, scope));
  } catch (error) {
    if (error instanceof AggregationValidationError) {
      console.warn("[aggregations] Invalid filters", { userId: session.id, message: error.message });
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error instanceof AggregationNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    console.error("[aggregations] Query failed", { userId: session.id, error });
    return NextResponse.json({ message: "Unable to calculate aggregations right now." }, { status: 500 });
  }
}
