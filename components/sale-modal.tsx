"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Minus, Plus, X } from "lucide-react";
import { currency } from "@/lib/format";
import type { InventoryRow } from "@/types";

type Result = { product: string; quantity: number; remainingInventory: number };

export function SaleModal({ row, onClose, onSuccess }: { row: InventoryRow; onClose: () => void; onSuccess: (result: Result) => void }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);

  async function completeSale() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storeId: row.storeId, productId: row.productId, quantity }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      onSuccess(result);
    } catch (err) { setError(err instanceof Error ? err.message : "The sale could not be completed."); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1813]/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onMouseDown={onClose}>
      <div className="w-full max-w-lg animate-rise rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#e8ecea] px-6 py-5"><div><p className="eyebrow mb-1.5">Complete a sale</p><h2 className="text-lg font-bold">{row.product.name}</h2></div><button aria-label="Close" onClick={onClose} className="flex size-9 items-center justify-center rounded-full bg-[#f2f5f3] text-[#68746f]"><X size={18}/></button></div>
        <div className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#f5f7f6] p-4"><p className="eyebrow">Unit price</p><p className="mt-2 text-xl font-bold">{currency(row.product.price)}</p></div><div className="rounded-xl bg-[#f5f7f6] p-4"><p className="eyebrow">Available</p><p className="mt-2 text-xl font-bold">{row.quantity} <span className="text-sm font-normal text-[#7b8781]">units</span></p></div></div>
          <div><label className="mb-2 block text-xs font-semibold text-[#46524c]">Quantity</label><div className="flex items-center rounded-xl border border-[#dce3df] p-1"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex size-10 items-center justify-center rounded-lg text-[#68746f] hover:bg-[#f2f5f3]"><Minus size={17}/></button><input aria-label="Quantity" type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="min-w-0 flex-1 text-center text-base font-bold outline-none"/><button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)} className="flex size-10 items-center justify-center rounded-lg text-[#68746f] hover:bg-[#f2f5f3]"><Plus size={17}/></button></div></div>
          <div className="flex items-center justify-between rounded-xl bg-[#eaf4f0] px-4 py-4"><span className="text-sm font-semibold text-[#456158]">Calculated total</span><span className="text-2xl font-bold tracking-tight text-[#0c5b42]">{currency(Math.max(0, quantity || 0) * row.product.price)}</span></div>
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="flex justify-end gap-3 pt-1"><button onClick={onClose} className="btn-secondary">Cancel</button><button disabled={loading || !Number.isInteger(quantity) || quantity <= 0} onClick={completeSale} className="btn-primary min-w-[148px]">{loading ? <><Loader2 size={16} className="animate-spin"/> Processing</> : <><CheckCircle2 size={16}/> Complete sale</>}</button></div>
        </div>
      </div>
    </div>
  );
}
