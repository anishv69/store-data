"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Building2, CircleDollarSign, Landmark, ReceiptText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SalesTrendChart, StoreSalesChart } from "@/components/charts";
import { LoadingScreen } from "@/components/loading-screen";
import { MetricCard } from "@/components/metric-card";
import { EditorialHero } from "@/components/editorial-hero";
import { useSession } from "@/components/use-session";
import { compactCurrency, currency } from "@/lib/format";
import type { RegionalDashboard } from "@/types";

export default function RegionalDashboardPage() {
  const { session, loading } = useSession("REGIONAL_MANAGER");
  const [data, setData] = useState<RegionalDashboard | null>(null);
  const load = useCallback(() => { if (session?.region) fetch(`/api/dashboard/region/${encodeURIComponent(session.region)}`).then((r) => r.json()).then(setData); }, [session]);
  useEffect(load, [load]);
  if (loading || !session || !data) return <LoadingScreen label="Aggregating regional performance"/>;

  return (
    <AppShell session={session}>
      <EditorialHero eyebrow="Regional command center" title={`${data.region} Region`} description={`Live performance across ${data.storeCount} stores, aggregated into one clear view.`} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total regional sales" value={compactCurrency(data.totalSales)} detail="Derived from store sales" icon={Landmark}/>
        <MetricCard label="Today’s sales" value={currency(data.todaySales)} detail="Across all locations" icon={CircleDollarSign}/>
        <MetricCard label="Transactions" value={data.transactionCount.toLocaleString()} detail="All completed sales" icon={ReceiptText}/>
        <MetricCard label="Active stores" value={String(data.storeCount)} detail="Michigan retail network" icon={Building2}/>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-2"><div className="panel p-5 md:p-6"><div className="mb-5"><p className="text-sm font-bold">Sales by store</p><p className="mt-1 text-xs text-[#86868b]">Ranked revenue with regional average</p></div><div className="h-[320px]"><StoreSalesChart data={data.stores}/></div></div><div className="panel p-5 md:p-6"><div className="mb-5"><p className="text-sm font-bold">Regional momentum</p><p className="mt-1 text-xs text-[#86868b]">Current 12 weeks compared with the previous period</p></div><div className="h-[320px]"><SalesTrendChart data={data.salesTrend}/></div></div></section>
      <section className="panel mt-5 overflow-hidden"><div className="flex items-center justify-between border-b border-[#e8e8ed] p-5"><div><p className="text-sm font-bold">Regional store comparison</p><p className="mt-1 text-xs text-[#86868b]">Only stores inside your assigned {data.region} region are included.</p></div><Link href="/stores" className="text-xs font-semibold text-[#0071e3]">View all</Link></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Store</th><th>Sales</th><th>Share</th><th>Avg. order</th><th>Inventory</th><th></th></tr></thead><tbody>{[...data.stores].sort((a,b) => b.sales-a.sales).map((store, index) => <tr key={store.id}><td><div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-[#eaf3ff] text-xs font-bold text-[#0071e3]">{index + 1}</span><div><p className="font-semibold">{store.name}</p><p className="mt-1 text-xs text-[#86868b]">{store.city}, {store.state}</p></div></div></td><td className="font-bold">{currency(store.sales)}</td><td>{data.totalSales ? `${((store.sales / data.totalSales) * 100).toFixed(1)}%` : "0%"}</td><td>{currency(store.transactions ? store.sales / store.transactions : 0)}</td><td>{store.inventory.toLocaleString()} units</td><td className="text-right!"><Link href={`/stores/${store.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#0071e3]">Analyze <ArrowRight size={14}/></Link></td></tr>)}</tbody></table></div></section>
    </AppShell>
  );
}
