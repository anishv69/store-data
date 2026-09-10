"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Boxes, CircleDollarSign, MapPin, ReceiptText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SalesTrendChart, StoreSalesChart, TopProductsChart } from "@/components/charts";
import { LoadingScreen } from "@/components/loading-screen";
import { MetricCard } from "@/components/metric-card";
import { useSession } from "@/components/use-session";
import { compactCurrency, currency, shortDate } from "@/lib/format";
import type { StoreDashboard } from "@/types";

export default function StoreDetailPage() {
  const { session, loading } = useSession();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<StoreDashboard | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { if (session) fetch(`/api/dashboard/store/${id}`).then(async (r) => { const body = await r.json(); if (!r.ok) throw new Error(body.message); return body; }).then(setData).catch((err) => setError(err.message)); }, [session, id]);
  if (loading || !session || (!data && !error)) return <LoadingScreen label="Opening store details"/>;
  if (error) return <AppShell session={session}><div className="panel p-8"><h1 className="text-xl font-bold">Store unavailable</h1><p className="muted mt-2">{error}</p><Link href="/stores" className="btn-primary mt-5">Back to stores</Link></div></AppShell>;
  if (!data) return null;
  return <AppShell session={session}>
    <Link href={session.role === "EXECUTIVE" ? "/executive-dashboard" : "/regional-dashboard"} className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#6e6e73] hover:text-[#0071e3]"><ArrowLeft size={14}/> {session.role === "EXECUTIVE" ? "Executive dashboard" : "Regional dashboard"}</Link>
    <div className="mb-7"><p className="eyebrow mb-2">Store drill-down</p><h1 className="page-title">{data.store.name}</h1><p className="muted mt-1.5 flex items-center gap-1.5"><MapPin size={14}/>{data.store.city}, {data.store.state} · {data.store.managerName}</p></div>
    <section className="grid gap-4 sm:grid-cols-3"><MetricCard label="Total sales" value={compactCurrency(data.totalSales)} detail="All store transactions" icon={CircleDollarSign}/><MetricCard label="Transactions" value={data.transactionCount.toLocaleString()} detail="Completed sales" icon={ReceiptText}/><MetricCard label="Inventory" value={data.inventoryUnits.toLocaleString()} detail={`${data.lowStock.length} need attention`} icon={Boxes}/></section>
    <section className="mt-5 grid gap-5 xl:grid-cols-2"><div className="panel p-5 md:p-6"><div className="mb-5"><p className="text-sm font-bold">Sales momentum</p><p className="mt-1 text-xs text-[#86868b]">Current 12 weeks compared with the previous period</p></div><div className="h-[300px]"><SalesTrendChart data={data.salesTrend}/></div></div><div className="panel p-5 md:p-6"><div className="mb-5"><p className="text-sm font-bold">Top products</p><p className="mt-1 text-xs text-[#86868b]">Revenue contribution by product</p></div><div className="h-[300px]"><TopProductsChart data={data.topProducts}/></div></div></section>
    {data.peerStores && data.peerStores.length > 1 && <section className="panel mt-5 p-5 md:p-6"><div className="mb-5"><p className="text-sm font-bold">Regional peer comparison</p><p className="mt-1 text-xs text-[#86868b]">{data.store.name} is highlighted against every store in {data.store.region}.</p></div><div className="h-[330px]"><StoreSalesChart data={data.peerStores} highlightName={data.store.name}/></div></section>}
    <section className="mt-5 grid gap-5 xl:grid-cols-2"><div className="panel overflow-hidden"><div className="border-b border-[#e6ebe8] p-5"><p className="text-sm font-bold">Inventory</p><p className="mt-1 text-xs text-[#7b8781]">Current on-hand units</p></div><div className="table-wrap"><table className="data-table min-w-[480px]!"><thead><tr><th>Product</th><th>SKU</th><th className="text-right!">Quantity</th></tr></thead><tbody>{data.inventory.map((row) => <tr key={row.id}><td className="font-semibold">{row.product.name}</td><td className="font-mono text-xs text-[#68746f]">{row.product.sku}</td><td className="text-right! font-bold">{row.quantity}</td></tr>)}</tbody></table></div></div><div className="panel overflow-hidden"><div className="border-b border-[#e6ebe8] p-5"><p className="text-sm font-bold">Recent transactions</p><p className="mt-1 text-xs text-[#7b8781]">Latest completed sales</p></div><div className="table-wrap"><table className="data-table min-w-[480px]!"><thead><tr><th>Product</th><th>Date</th><th className="text-right!">Amount</th></tr></thead><tbody>{data.recentTransactions.map((row) => <tr key={row.id}><td><p className="font-semibold">{row.product}</p><p className="mt-1 text-xs text-[#8a9590]">{row.quantity} units</p></td><td className="text-xs text-[#68746f]">{shortDate(row.createdAt)}</td><td className="text-right! font-bold">{currency(row.totalAmount)}</td></tr>)}</tbody></table></div></div></section>
  </AppShell>;
}
