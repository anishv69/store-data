import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: LucideIcon }) {
  return (
    <div className="panel animate-rise p-5">
      <div className="mb-5 flex items-center justify-between"><span className="eyebrow">{label}</span><span className="flex size-9 items-center justify-center rounded-xl bg-[#edf5f1] text-[#126c4e]"><Icon size={18} /></span></div>
      <div className="text-[27px] font-bold tracking-[-0.04em] text-[#15221d]">{value}</div>
      <div className="mt-2 flex items-center gap-1 text-xs text-[#7b8781]"><ArrowUpRight size={13} className="text-[#1b8a64]" />{detail}</div>
    </div>
  );
}
