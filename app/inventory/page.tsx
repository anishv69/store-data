"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search, ShoppingBag, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LoadingScreen } from "@/components/loading-screen";
import { SaleModal } from "@/components/sale-modal";
import { useSession } from "@/components/use-session";
import { currency } from "@/lib/format";
import type { InventoryRow } from "@/types";

function stockStatus(quantity: number) {
  if (quantity === 0) return { label: "Out of stock", className: "bg-red-50 text-red-700" };
  if (quantity <= 20) return { label: "Low stock", className: "bg-amber-50 text-amber-700" };
  return { label: "In stock", className: "bg-emerald-50 text-emerald-700" };
}

export default function InventoryPage() {
  const { session, loading } = useSession("STORE_MANAGER");
  const [rows, setRows] = useState<InventoryRow[] | null>(null);
  const [selected, setSelected] = useState<InventoryRow | null>(null);
  const [query, setQuery] = useState("");
  const [success, setSuccess] = useState<{ product: string; quantity: number; remainingInventory: number } | null>(null);
  const load = useCallback(() => { if (session?.storeId) fetch(`/api/stores/${session.storeId}/inventory`).then((r) => r.json()).then(setRows); }, [session]);
  useEffect(load, [load]);
  const filtered = useMemo(() => rows?.filter((row) => `${row.product.name} ${row.product.sku} ${row.product.category}`.toLowerCase().includes(query.toLowerCase())) ?? [], [rows, query]);
  if (loading || !session || !rows) return <LoadingScreen label="Counting inventory"/>;

  return (
    <AppShell session={session}>
      <div className="mb-7"><p className="eyebrow mb-2">Store operations</p><h1 className="page-title">Inventory</h1><p className="muted mt-1.5">Review availability and complete customer sales.</p></div>
      {success && <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="mt-0.5 shrink-0" size={19}/><div className="text-sm"><p className="font-bold">Sale completed successfully.</p><p className="mt-0.5">{success.quantity} {success.product} sold. Remaining inventory: {success.remainingInventory}.</p></div><button className="ml-auto" aria-label="Dismiss" onClick={() => setSuccess(null)}><X size={17}/></button></div>}
      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#e6ebe8] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold">Product inventory</p><p className="mt-1 text-xs text-[#7b8781]">{rows.reduce((sum, row) => sum + row.quantity, 0).toLocaleString()} units across {rows.length} products</p></div><label className="relative block sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9892]" size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} className="field py-2.5 pl-9" placeholder="Search products or SKU"/></label></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>SKU</th><th>Price</th><th>Quantity</th><th>Status</th><th></th></tr></thead><tbody>{filtered.map((row) => { const status = stockStatus(row.quantity); return <tr key={row.id}><td><p className="font-semibold">{row.product.name}</p><p className="mt-1 text-xs text-[#8a9590]">{row.product.category}</p></td><td className="font-mono text-xs text-[#68746f]">{row.product.sku}</td><td className="font-semibold">{currency(row.product.price)}</td><td><span className="text-base font-bold">{row.quantity}</span></td><td><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}>{status.label}</span></td><td className="text-right!"><button disabled={row.quantity === 0} onClick={() => setSelected(row)} className="btn-secondary px-3! py-2! disabled:cursor-not-allowed disabled:opacity-40"><ShoppingBag size={15}/> Sell</button></td></tr>; })}</tbody></table>{filtered.length === 0 && <div className="py-14 text-center text-sm text-[#7b8781]">No products match “{query}”.</div>}</div>
      </div>
      {selected && <SaleModal row={selected} onClose={() => setSelected(null)} onSuccess={(result) => { setSelected(null); setSuccess(result); load(); }}/>} 
    </AppShell>
  );
}
