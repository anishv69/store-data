"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Boxes, CircleDollarSign, Clock3, PackageOpen, ReceiptText, ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SalesTrendChart, TopProductsChart } from "@/components/charts";
import { LoadingScreen } from "@/components/loading-screen";
import { MetricCard } from "@/components/metric-card";
import { EditorialHero } from "@/components/editorial-hero";
import { useSession } from "@/components/use-session";
import { compactCurrency, currency, shortDate } from "@/lib/format";
import type { StoreDashboard } from "@/types";

export default function StoreDashboardPage() {
  const { session, loading: sessionLoading } = useSession("STORE_MANAGER");
  const [data, setData] = useState<StoreDashboard | null>(null);
  const load = useCallback(() => {
    if (!session?.storeId) return;
    fetch(`/api/dashboard/store/${session.storeId}`).then((r) => r.json()).then(setData);
  }, [session]);
  useEffect(load, [load]);
  if (sessionLoading || !session || !data) return <LoadingScreen label="Loading store performance" />;

  return (
    <AppShell session={session}>
      <EditorialHero eyebrow="Store performance" title={data.store.name} description={`${data.store.city}, ${data.store.state} · Managed by ${data.store.managerName}`}>
        <Link href="/inventory" className="btn-primary"><ShoppingBag size={17}/> New sale</Link>
      </EditorialHero>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Today’s sales" value={currency(data.todaySales)} detail="Updates after every sale" icon={CircleDollarSign}/>
        <MetricCard label="Monthly sales" value={compactCurrency(data.monthlySales)} detail="Current calendar month" icon={Clock3}/>
        <MetricCard label="Transactions" value={data.transactionCount.toLocaleString()} detail="All completed sales" icon={ReceiptText}/>
        <MetricCard label="Inventory units" value={data.inventoryUnits.toLocaleString()} detail={`${data.lowStock.length} low-stock products`} icon={Boxes}/>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="panel p-5 md:p-6"><div className="mb-5"><p className="text-sm font-bold">Sales momentum</p><p className="mt-1 text-xs text-[#86868b]">Current 12 weeks compared with the previous period</p></div><div className="h-[300px]"><SalesTrendChart data={data.salesTrend}/></div></div>
        <div className="panel p-5 md:p-6"><div className="mb-5"><p className="text-sm font-bold">Top selling products</p><p className="mt-1 text-xs text-[#86868b]">Ranked by revenue contribution</p></div><div className="h-[300px]"><TopProductsChart data={data.topProducts}/></div></div>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="panel overflow-hidden"><div className="flex items-center justify-between px-5 py-5 md:px-6"><div><p className="text-sm font-bold">Recent transactions</p><p className="mt-1 text-xs text-[#86868b]">Latest completed sales</p></div><Link className="text-xs font-semibold text-[#0071e3]" href="/transactions">View all</Link></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>Time</th><th>Qty</th><th className="text-right!">Total</th></tr></thead><tbody>{data.recentTransactions.map((row) => <tr key={row.id}><td><p className="font-semibold">{row.product}</p><p className="mt-0.5 text-xs text-[#86868b]">#{String(row.id).padStart(6, "0")}</p></td><td className="text-[#6e6e73]">{shortDate(row.createdAt)}</td><td>{row.quantity}</td><td className="text-right! font-semibold">{currency(row.totalAmount)}</td></tr>)}</tbody></table></div></div>
        <div className="panel p-5 md:p-6"><div className="mb-5 flex items-start justify-between"><div><p className="text-sm font-bold">Stock attention</p><p className="mt-1 text-xs text-[#7b8781]">Products at 20 units or fewer</p></div><PackageOpen size={19} className="text-[#b7791f]"/></div><div className="space-y-3">{data.lowStock.length ? data.lowStock.map((row) => <div key={row.id} className="flex items-center justify-between rounded-xl bg-[#faf6ed] px-4 py-3"><div><p className="text-sm font-semibold">{row.product.name}</p><p className="mt-0.5 text-[11px] text-[#8a7657]">{row.product.sku}</p></div><span className="rounded-full bg-[#f0dfbd] px-2.5 py-1 text-xs font-bold text-[#8a611d]">{row.quantity} left</span></div>) : <div className="rounded-xl bg-[#edf6f2] p-5 text-center text-sm text-[#39745e]">All products are well stocked.</div>}</div></div>
      </section>
    </AppShell>
  );
}
