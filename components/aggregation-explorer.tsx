"use client";

import { useEffect, useState } from "react";
import { BarChart3, Filter, Loader2, RotateCcw } from "lucide-react";
import { StoreSalesChart } from "@/components/charts";
import { compactCurrency, currency } from "@/lib/format";
import type { AggregationBreakdown, AggregationFilters, AggregationResponse } from "@/types";

const emptyFilters: AggregationFilters = { state: "", city: "", product: "" };

export function AggregationExplorer({ title, description }: { title: string; description: string }) {
  const [draft, setDraft] = useState<AggregationFilters>(emptyFilters);
  const [applied, setApplied] = useState<AggregationFilters>(emptyFilters);
  const [data, setData] = useState<AggregationResponse | null>(null);
  const [catalog, setCatalog] = useState<AggregationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(filters: AggregationFilters, preserveCatalog = true) {
    setLoading(true);
    setError("");
    const search = new URLSearchParams();
    if (filters.state?.trim()) search.set("state", filters.state.trim());
    if (filters.city?.trim()) search.set("city", filters.city.trim());
    if (filters.product?.trim()) search.set("product", filters.product.trim());
    try {
      const response = await fetch(`/api/aggregations${search.size ? `?${search}` : ""}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Unable to calculate aggregation.");
      setData(body);
      if (!preserveCatalog || !catalog) setCatalog(body);
      setApplied(filters);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to calculate aggregation.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(emptyFilters, false); }, []);

  function drill(dimension: "state" | "city" | "product", value: string) {
    const next = { ...draft, [dimension]: value };
    if (dimension === "state") {
      next.city = "";
      next.product = "";
    }
    if (dimension === "city") next.product = "";
    setDraft(next);
    void load(next);
  }

  function reset() {
    setDraft(emptyFilters);
    void load(emptyFilters);
  }

  const activeBreakdown: { label: string; dimension: "state" | "city" | "product"; rows: AggregationBreakdown[] } = !applied.state && !applied.city && !applied.product
    ? { label: "State", dimension: "state", rows: data?.byState ?? [] }
    : applied.state && !applied.city && !applied.product
      ? { label: "City", dimension: "city", rows: data?.byCity ?? [] }
      : { label: "Product", dimension: "product", rows: data?.byProduct ?? [] };

  return (
    <section className="panel mt-5 overflow-hidden">
      <div className="border-b border-[#e8e8ed] p-5 md:p-6">
        <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#0071e3]"><BarChart3 size={19}/></span><div><h2 className="text-lg font-semibold tracking-[-0.02em]">{title}</h2><p className="mt-1 text-sm text-[#6e6e73]">{description}</p></div></div>
        <form onSubmit={(event) => { event.preventDefault(); void load(draft); }} className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto_auto]">
          <label><span className="mb-1.5 block text-[11px] font-semibold text-[#6e6e73]">State</span><select className="field" value={draft.state ?? ""} onChange={(event) => setDraft({ ...draft, state: event.target.value })}><option value="">All states</option>{catalog?.byState.map((row) => <option key={row.key} value={row.key}>{row.label}</option>)}</select></label>
          <label><span className="mb-1.5 block text-[11px] font-semibold text-[#6e6e73]">City</span><select className="field" value={draft.city ?? ""} onChange={(event) => setDraft({ ...draft, city: event.target.value })}><option value="">All cities</option>{catalog?.byCity.map((row) => <option key={row.key} value={row.key}>{row.label}</option>)}</select></label>
          <label><span className="mb-1.5 block text-[11px] font-semibold text-[#6e6e73]">Product</span><input className="field" list="aggregation-products" value={draft.product ?? ""} onChange={(event) => setDraft({ ...draft, product: event.target.value })} placeholder="All products"/><datalist id="aggregation-products">{catalog?.byProduct.map((row) => <option key={row.key} value={row.key}/>)}</datalist></label>
          <button disabled={loading} className="btn-primary self-end py-3!">{loading ? <Loader2 size={16} className="animate-spin"/> : <Filter size={16}/>} Apply</button>
          <button type="button" onClick={reset} disabled={loading} className="btn-secondary self-end py-3!"><RotateCcw size={15}/> Reset</button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#6e6e73]"><span className="font-semibold text-[#1d1d1f]">Overall</span>{applied.state && <><span>→</span><button onClick={() => drill("state", applied.state!)} className="cursor-pointer text-[#0071e3]">{applied.state}</button></>}{applied.city && <><span>→</span><button onClick={() => drill("city", applied.city!)} className="cursor-pointer text-[#0071e3]">{applied.city}</button></>}{applied.product && <><span>→</span><span className="text-[#1d1d1f]">{applied.product}</span></>}</div>
      </div>

      {error && <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {data && !error && <>
        <div className="grid gap-px bg-[#e8e8ed] sm:grid-cols-2 xl:grid-cols-4"><Summary label="Revenue" value={compactCurrency(data.summary.totalRevenue)}/><Summary label="Quantity" value={data.summary.totalQuantity.toLocaleString()}/><Summary label="Transactions" value={data.summary.transactionCount.toLocaleString()}/><Summary label="Average transaction" value={currency(data.summary.averageTransactionAmount)}/></div>
        <div className="grid gap-6 p-5 md:p-6 xl:grid-cols-[1fr_1.1fr]">
          <div><p className="text-sm font-semibold">Revenue by {activeBreakdown.label.toLowerCase()}</p><p className="mt-1 text-xs text-[#86868b]">Select a row to continue the drill-down.</p><div className="mt-4 h-[320px]"><StoreSalesChart data={activeBreakdown.rows.map((row) => ({ name: row.label, sales: row.totalRevenue }))}/></div></div>
          <div className="table-wrap"><table className="data-table min-w-[560px]!"><thead><tr><th>{activeBreakdown.label}</th><th>Revenue</th><th>Quantity</th><th>Transactions</th><th>Average</th></tr></thead><tbody>{activeBreakdown.rows.map((row) => <tr key={row.key} className="cursor-pointer hover:bg-[#f5f5f7]" onClick={() => drill(activeBreakdown.dimension, row.key)}><td className="font-semibold text-[#0071e3]">{row.label}</td><td className="font-semibold">{currency(row.totalRevenue)}</td><td>{row.totalQuantity.toLocaleString()}</td><td>{row.transactionCount.toLocaleString()}</td><td>{currency(row.averageTransactionAmount)}</td></tr>)}</tbody></table></div>
        </div>
      </>}
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="bg-white p-5"><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-0.035em]">{value}</p></div>;
}
