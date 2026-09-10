"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Building2, CircleDollarSign, Landmark, ReceiptText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SalesTrendChart, StoreSalesChart } from "@/components/charts";
import { LoadingScreen } from "@/components/loading-screen";
import { MetricCard } from "@/components/metric-card";
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
      <div className="mb-7"><p className="eyebrow mb-2">Regional command center</p><h1 className="page-title">{data.region} Region</h1><p className="muted mt-1.5">Live performance across all stores in your region.</p></div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total regional sales" value={compactCurrency(data.totalSales)} detail="Derived from store sales" icon={Landmark}/>
        <MetricCard label="Today’s sales" value={currency(data.todaySales)} detail="Across all locations" icon={CircleDollarSign}/>
        <MetricCard label="Transactions" value={data.transactionCount.toLocaleString()} detail="All completed sales" icon={ReceiptText}/>
        <MetricCard label="Active stores" value={String(data.storeCount)} detail="Michigan retail network" icon={Building2}/>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-2"><div className="panel p-5 md:p-6"><div className="mb-5"><p className="text-sm font-bold">Sales by store</p><p className="mt-1 text-xs text-[#7b8781]">Lifetime revenue comparison</p></div><div className="h-[270px]"><StoreSalesChart data={data.stores}/></div></div><div className="panel p-5 md:p-6"><div className="mb-5"><p className="text-sm font-bold">Regional sales trend</p><p className="mt-1 text-xs text-[#7b8781]">Combined daily revenue · Last 7 days</p></div><div className="h-[270px]"><SalesTrendChart data={data.salesTrend}/></div></div></section>
      <section className="panel mt-5 overflow-hidden"><div className="flex items-center justify-between border-b border-[#e6ebe8] p-5"><div><p className="text-sm font-bold">Store comparison</p><p className="mt-1 text-xs text-[#7b8781]">Select a store to inspect operations</p></div><Link href="/stores" className="text-xs font-bold text-[#126c4e]">View all</Link></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Store</th><th>Sales</th><th>Transactions</th><th>Inventory</th><th></th></tr></thead><tbody>{[...data.stores].sort((a,b) => b.sales-a.sales).map((store, index) => <tr key={store.id}><td><div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-[#edf5f1] text-xs font-bold text-[#126c4e]">{index + 1}</span><div><p className="font-semibold">{store.name}</p><p className="mt-1 text-xs text-[#8a9590]">{store.city}, MI</p></div></div></td><td className="font-bold">{currency(store.sales)}</td><td>{store.transactions.toLocaleString()}</td><td>{store.inventory.toLocaleString()} units</td><td className="text-right!"><Link href={`/stores/${store.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#126c4e]">Open <ArrowRight size={14}/></Link></td></tr>)}</tbody></table></div></section>
    </AppShell>
  );
}
