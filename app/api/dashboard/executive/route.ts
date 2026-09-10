import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getExecutiveComparisons, getExecutiveDashboard, getExecutiveOptions, getStoreDashboard } from "@/lib/dashboard";
import type { HierarchyLevel } from "@/types";

const levels = new Set(["company", "area", "countryGroup", "stateGroup", "market", "store"]);

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  if (session.role !== "EXECUTIVE") return NextResponse.json({ message: "Executive access is required." }, { status: 403 });

  const search = new URL(request.url).searchParams;
  const level = search.get("level") ?? "company";
  const value = search.get("value") ?? "Apple Inc";
  if (!levels.has(level) || !value.trim()) return NextResponse.json({ message: "Invalid organization level." }, { status: 400 });

  const [options, comparisons] = await Promise.all([getExecutiveOptions(), getExecutiveComparisons()]);
  if (level === "store") {
    const dashboard = await getStoreDashboard(Number(value));
    if (!dashboard) return NextResponse.json({ message: "Store not found." }, { status: 404 });
    return NextResponse.json({
      level: "store",
      label: dashboard.store.name,
      nextLevel: null,
      breadcrumbs: [
        { level: "company", label: dashboard.store.company },
        { level: "area", label: dashboard.store.area },
        { level: "countryGroup", label: dashboard.store.countryGroup },
        { level: "stateGroup", label: dashboard.store.stateGroup },
        { level: "market", label: dashboard.store.market },
        { level: "store", label: dashboard.store.name },
      ],
      totalSales: dashboard.totalSales,
      todaySales: dashboard.todaySales,
      transactionCount: dashboard.transactionCount,
      inventoryUnits: dashboard.inventoryUnits,
      storeCount: 1,
      children: [],
      salesTrend: dashboard.salesTrend,
      topProducts: dashboard.topProducts,
      options,
      ...comparisons,
    });
  }

  const dashboard = await getExecutiveDashboard(level as HierarchyLevel, value);
  return dashboard
    ? NextResponse.json({ ...dashboard, options, ...comparisons })
    : NextResponse.json({ message: "Organization level not found." }, { status: 404 });
}
