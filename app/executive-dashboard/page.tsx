"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Boxes, CircleDollarSign, Landmark, ReceiptText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { OperationsChart, RevenueMixChart, SalesTrendChart, StoreSalesChart, TopProductsChart } from "@/components/charts";
import { LoadingScreen } from "@/components/loading-screen";
import { MetricCard } from "@/components/metric-card";
import { EditorialHero } from "@/components/editorial-hero";
import { AggregationExplorer } from "@/components/aggregation-explorer";
import { useSession } from "@/components/use-session";
import { compactCurrency, currency } from "@/lib/format";
import type { ExecutiveDashboard, ExecutiveLevel } from "@/types";

const labels: Record<ExecutiveLevel, string> = {
  company: "Company",
  area: "Geography",
  countryGroup: "Country",
  stateGroup: "State",
  market: "Market",
  store: "Store",
};

function ExecutiveContent() {
  const { session, loading } = useSession("EXECUTIVE");
  const search = useSearchParams();
  const router = useRouter();
  const level = (search.get("level") ?? "company") as ExecutiveLevel;
  const value = search.get("value") ?? "Apple Inc";
  const [data, setData] = useState<ExecutiveDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    setData(null);
    setError("");
    fetch(`/api/dashboard/executive?level=${encodeURIComponent(level)}&value=${encodeURIComponent(value)}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message);
        return body;
      })
      .then(setData)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load executive data."));
  }, [session, level, value]);

  const groupedOptions = useMemo(() => {
    const groups = new Map<string, ExecutiveDashboard["options"]>();
    for (const option of data?.options ?? []) groups.set(option.group, [...(groups.get(option.group) ?? []), option]);
    return [...groups.entries()];
  }, [data]);

  if (loading || !session || (!data && !error)) return <LoadingScreen label="Preparing executive analysis"/>;
  if (!data) return <AppShell session={session}><div className="panel p-8"><h1 className="text-xl font-bold">Executive view unavailable</h1><p className="muted mt-2">{error}</p></div></AppShell>;

  const mixData = data.children.length ? data.children : data.topProducts;
  const selectedKey = `${data.level}|${data.level === "store" ? value : data.label}`;

  function changeView(key: string) {
    const separator = key.indexOf("|");
    const nextLevel = key.slice(0, separator);
    const nextValue = key.slice(separator + 1);
    router.replace(`/executive-dashboard?level=${nextLevel}&value=${encodeURIComponent(nextValue)}`);
  }

  return (
    <AppShell session={session}>
      <EditorialHero eyebrow="CFO sales intelligence" title={data.label} description={`${data.breadcrumbs.map((crumb) => crumb.label).join(" / ")} · Aggregated performance across ${data.storeCount} store${data.storeCount === 1 ? "" : "s"}.`}>
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold text-[#515154]">View organization</span>
          <select value={selectedKey} onChange={(event) => changeView(event.target.value)} className="field cursor-pointer bg-white/90 font-semibold shadow-sm backdrop-blur-md">
            {groupedOptions.map(([group, options]) => <optgroup label={group} key={group}>{options.map((option) => <option value={`${option.level}|${option.value}`} key={`${option.level}-${option.value}`}>{option.label}</option>)}</optgroup>)}
          </select>
        </label>
        {data.level === "store" && <Link href={`/stores/${value}`} className="btn-secondary mt-3 bg-white/85">Open full store analysis</Link>}
      </EditorialHero>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total sales" value={compactCurrency(data.totalSales)} detail={`Aggregated from ${data.storeCount} store${data.storeCount === 1 ? "" : "s"}`} icon={Landmark}/>
        <MetricCard label="Today’s sales" value={currency(data.todaySales)} detail="Live store transactions" icon={CircleDollarSign}/>
        <MetricCard label="Transactions" value={data.transactionCount.toLocaleString()} detail="Completed sales" icon={ReceiptText}/>
        <MetricCard label="Inventory units" value={data.inventoryUnits.toLocaleString()} detail="Current units on hand" icon={Boxes}/>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartPanel title="Sales momentum" subtitle="Current 12 weeks compared with the previous period"><SalesTrendChart data={data.salesTrend}/></ChartPanel>
        <ChartPanel title="Revenue mix" subtitle={data.children.length ? `Contribution by ${labels[data.nextLevel ?? "store"].toLowerCase()}` : "Contribution by product"}><RevenueMixChart data={mixData}/></ChartPanel>
        {data.children.length > 0 && <ChartPanel title="Operating balance" subtitle="Inventory bars and transaction trend use independent scales"><OperationsChart data={data.children}/></ChartPanel>}
        <ChartPanel title="Top products" subtitle="Products ranked by sales revenue"><TopProductsChart data={data.topProducts}/></ChartPanel>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartPanel title="Region comparison" subtitle="Company-wide revenue ranking by operating region"><StoreSalesChart data={data.regionComparison}/></ChartPanel>
        <ChartPanel title="Store comparison" subtitle="Top stores across the company by total revenue"><StoreSalesChart data={data.storeComparison.slice(0, 8)}/></ChartPanel>
      </section>

      <section className="panel mt-5 overflow-hidden">
        <div className="border-b border-[#e8e8ed] p-5"><p className="text-sm font-semibold">Company store leaderboard</p><p className="mt-1 text-xs text-[#86868b]">Compare sales, average order value, inventory, and open any store’s detailed analysis.</p></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Store</th><th>Region</th><th>Sales</th><th>Avg. order</th><th>Inventory</th><th></th></tr></thead><tbody>{data.storeComparison.map((store) => <tr key={store.id}><td><p className="font-semibold">{store.name}</p><p className="mt-1 text-xs text-[#86868b]">{store.city}, {store.state}</p></td><td>{store.region}</td><td className="font-semibold">{currency(store.sales)}</td><td>{currency(store.averageOrderValue)}</td><td>{store.inventory.toLocaleString()} units</td><td className="text-right!"><Link href={`/stores/${store.id}`} className="text-xs font-semibold text-[#0071e3]">Analyze</Link></td></tr>)}</tbody></table></div>
      </section>

      <AggregationExplorer title="Flexible sales aggregation" description="Filter independently by state, city, or product, or combine all three. Select a result to move from state to city to product." />

      {data.children.length > 0 && (
        <section className="panel mt-5 overflow-hidden">
          <div className="border-b border-[#e6ebe8] p-5"><p className="text-sm font-bold">{labels[data.nextLevel ?? "store"]} sales breakdown</p><p className="mt-1 text-xs text-[#7b8781]">Analysis for the selected organization view. Use the selector above to change levels.</p></div>
          <div className="table-wrap"><table className="data-table"><thead><tr><th>{labels[data.nextLevel ?? "store"]}</th><th>Sales</th><th>Transactions</th><th>Inventory</th><th>Stores</th></tr></thead><tbody>{data.children.map((child) => <tr key={child.name}><td className="font-bold">{child.name}</td><td className="font-bold">{currency(child.sales)}</td><td>{child.transactions.toLocaleString()}</td><td>{child.inventory.toLocaleString()} units</td><td>{child.storeCount}</td></tr>)}</tbody></table></div>
        </section>
      )}
    </AppShell>
  );
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <div className="panel p-5 md:p-6"><div className="mb-5"><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-[#86868b]">{subtitle}</p></div><div className="h-[285px]">{children}</div></div>;
}

export default function ExecutiveDashboardPage() {
  return <Suspense fallback={<LoadingScreen label="Loading executive workspace"/>}><ExecutiveContent/></Suspense>;
}
