"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownUp, ReceiptText, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LoadingScreen } from "@/components/loading-screen";
import { useSession } from "@/components/use-session";
import { currency, shortDate } from "@/lib/format";
import type { TransactionRow } from "@/types";

export default function TransactionsPage() {
  const { session, loading } = useSession("STORE_MANAGER");
  const [rows, setRows] = useState<TransactionRow[] | null>(null);
  const [query, setQuery] = useState("");
  const [newest, setNewest] = useState(true);
  const load = useCallback(() => { if (session?.storeId) fetch(`/api/stores/${session.storeId}/transactions`).then((r) => r.json()).then(setRows); }, [session]);
  useEffect(load, [load]);
  const filtered = useMemo(() => (rows ?? []).filter((row) => `${row.product} ${row.id}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => (newest ? -1 : 1) * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())), [rows, query, newest]);
  if (loading || !session || !rows) return <LoadingScreen label="Loading transactions"/>;
  const total = rows.reduce((sum, row) => sum + row.totalAmount, 0);
  return (
    <AppShell session={session}>
      <div className="mb-7"><p className="eyebrow mb-2">Sales ledger</p><h1 className="page-title">Transactions</h1><p className="muted mt-1.5">A complete, newest-first record of store sales.</p></div>
      <div className="mb-5 grid gap-4 sm:grid-cols-2"><div className="panel flex items-center gap-4 p-5"><span className="flex size-11 items-center justify-center rounded-xl bg-[#edf5f1] text-[#126c4e]"><ReceiptText size={20}/></span><div><p className="eyebrow">Completed sales</p><p className="mt-1 text-2xl font-bold">{rows.length}</p></div></div><div className="panel p-5"><p className="eyebrow">Recorded revenue</p><p className="mt-1 text-2xl font-bold">{currency(total)}</p></div></div>
      <div className="panel overflow-hidden"><div className="flex flex-col gap-3 border-b border-[#e6ebe8] p-5 sm:flex-row sm:justify-between"><label className="relative sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9892]" size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} className="field py-2.5 pl-9" placeholder="Search transaction"/></label><button onClick={() => setNewest(!newest)} className="btn-secondary"><ArrowDownUp size={15}/>{newest ? "Newest first" : "Oldest first"}</button></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Transaction ID</th><th>Date</th><th>Product</th><th>Quantity</th><th>Unit price</th><th className="text-right!">Total amount</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}><td className="font-mono text-xs font-semibold text-[#53615a]">#{String(row.id).padStart(6, "0")}</td><td className="text-[#68746f]">{shortDate(row.createdAt)}</td><td className="font-semibold">{row.product}</td><td>{row.quantity}</td><td>{currency(row.unitPrice)}</td><td className="text-right! font-bold">{currency(row.totalAmount)}</td></tr>)}</tbody></table></div></div>
    </AppShell>
  );
}
