import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: LucideIcon }) {
  return (
    <div className="panel animate-rise p-6 md:p-7">
      <div className="mb-7 flex items-center justify-between"><span className="eyebrow">{label}</span><span className="flex size-10 items-center justify-center rounded-full bg-[#eaf3ff] text-[#0071e3]"><Icon size={18} strokeWidth={1.8}/></span></div>
      <div className="text-[30px] font-semibold tracking-[-0.045em] text-[#1d1d1f]">{value}</div>
      <div className="mt-2 flex items-center gap-1 text-xs text-[#86868b]"><ArrowUpRight size={13} className="text-[#0071e3]" />{detail}</div>
    </div>
  );
}
