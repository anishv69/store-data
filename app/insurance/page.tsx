"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Landmark, ShieldCheck, WalletCards } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PortfolioBarChart } from "@/components/charts";
import { LoadingScreen } from "@/components/loading-screen";
import { MetricCard } from "@/components/metric-card";
import { useSession } from "@/components/use-session";
import { compactCurrency, currency } from "@/lib/format";
import type { InsuranceDashboard, InsurancePolicyStatus, InsuranceRequirement } from "@/types";

const requirementLabels: Record<InsuranceRequirement, string> = {
  STATUTORY: "Statutory",
  CONTRACTUAL: "Contractual",
  GOVERNANCE: "Governance",
  RISK_MANAGEMENT: "Risk management",
};

const statusLabels: Record<InsurancePolicyStatus, string> = {
  ACTIVE: "Active",
  RENEWAL_DUE: "Renewal due",
  EXPIRED: "Expired",
};

const financingLabels = {
  CAPTIVE: "Captive",
  COMMERCIAL: "Commercial",
  HYBRID: "Captive + commercial",
  STATE_PROGRAM: "State program",
};

function dateOnly(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export default function InsurancePage() {
  const { session, loading: sessionLoading } = useSession("EXECUTIVE");
  const [data, setData] = useState<InsuranceDashboard | null>(null);
  const [category, setCategory] = useState("");
  const [requirement, setRequirement] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!session) return;
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (requirement) params.set("requirement", requirement);
    if (status) params.set("status", status);

    setRefreshing(true);
    setError("");
    fetch(`/api/insurance?${params.toString()}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message);
        return body as InsuranceDashboard;
      })
      .then(setData)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load insurance data."))
      .finally(() => setRefreshing(false));
  }, [session, category, requirement, status]);

  if (sessionLoading || !session || (!data && !error)) return <LoadingScreen label="Preparing insurance portfolio" />;
  if (!data) return <AppShell session={session}><div className="panel p-8"><h1 className="text-xl font-semibold">Insurance portfolio unavailable</h1><p className="muted mt-2">{error}</p></div></AppShell>;

  return (
    <AppShell session={session}>
      <section className="mb-6 overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,#071f3f_0%,#123f77_58%,#327ac0_100%)] px-7 py-10 text-white sm:px-10 md:py-14">
        <div className="max-w-[720px]">
          <p className="text-[12px] font-semibold text-[#8fc7ff]">Enterprise risk intelligence</p>
          <h1 className="mt-2 text-[40px] font-semibold leading-none tracking-[-0.05em] sm:text-[54px]">Insurance portfolio</h1>
          <p className="mt-5 max-w-[650px] text-[15px] leading-6 text-white/75 md:text-[17px]">A CFO view of statutory, contractual, governance, and risk-management coverages across a fictional global technology retailer.</p>
          <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 text-xs leading-5 text-white/70 backdrop-blur-sm">
            Demo only: policy structures, limits, premiums, and identifiers are illustrative. They do not represent Apple Inc. insurance disclosures.
          </div>
        </div>
      </section>

      <section className="panel mb-5 p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-4 md:items-end">
          <Filter label="Category" value={category} onChange={setCategory}>
            <option value="">All categories</option>
            {data.options.categories.map((option) => <option key={option} value={option}>{option}</option>)}
          </Filter>
          <Filter label="Requirement" value={requirement} onChange={setRequirement}>
            <option value="">All requirements</option>
            {data.options.requirements.map((option) => <option key={option} value={option}>{requirementLabels[option]}</option>)}
          </Filter>
          <Filter label="Status" value={status} onChange={setStatus}>
            <option value="">All statuses</option>
            {data.options.statuses.map((option) => <option key={option} value={option}>{statusLabels[option]}</option>)}
          </Filter>
          <button type="button" className="btn-secondary" onClick={() => { setCategory(""); setRequirement(""); setStatus(""); }} disabled={!category && !requirement && !status}>Clear filters</button>
        </div>
        {refreshing && <p className="mt-3 text-xs text-[#86868b]">Refreshing portfolio...</p>}
        {error && <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Policies" value={data.summary.policyCount.toLocaleString()} detail={`${data.summary.activePolicies} active`} icon={ShieldCheck} />
        <MetricCard label="Scheduled limits" value={compactCurrency(data.summary.totalCoverageLimit)} detail="Sum across selected policies" icon={Landmark} />
        <MetricCard label="Annual premium" value={compactCurrency(data.summary.totalAnnualPremium)} detail="Illustrative annual spend" icon={WalletCards} />
        <MetricCard label="Renewal due" value={data.summary.renewalDue.toLocaleString()} detail={`${compactCurrency(data.summary.totalRetainedAmount)} retained`} icon={CalendarClock} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartPanel title="Coverage limits by category" subtitle="Scheduled policy limits, not the maximum recoverable amount"><PortfolioBarChart data={data.byCategory} dataKey="coverageLimit" label="Coverage limit" /></ChartPanel>
        <ChartPanel title="Premium by category" subtitle="Illustrative annual premium allocation"><PortfolioBarChart data={data.byCategory} dataKey="annualPremium" label="Annual premium" /></ChartPanel>
      </section>

      <section className="panel mt-5 overflow-hidden">
        <div className="border-b border-[#e8e8ed] p-5">
          <p className="text-sm font-semibold">Coverage register</p>
          <p className="mt-1 text-xs text-[#86868b]">{data.policies.length} policies match the selected portfolio filters.</p>
        </div>
        <div className="table-wrap">
          <table className="data-table min-w-[1100px]">
            <thead><tr><th>Coverage</th><th>Category</th><th>Basis</th><th>Financing</th><th>Geography</th><th>Limit</th><th>Premium</th><th>Expiration</th><th>Status</th></tr></thead>
            <tbody>
              {data.policies.map((policy) => (
                <tr key={policy.id}>
                  <td><p className="font-semibold">{policy.coverageName}</p><p className="mt-1 max-w-[260px] text-xs leading-4 text-[#86868b]">{policy.description}</p><p className="mt-1 text-[10px] text-[#86868b]">{policy.policyCode}</p></td>
                  <td>{policy.category}</td>
                  <td>{requirementLabels[policy.requirement]}</td>
                  <td>{financingLabels[policy.financing]}</td>
                  <td>{policy.geography}</td>
                  <td className="font-semibold">{currency(policy.coverageLimit)}</td>
                  <td>{currency(policy.annualPremium)}</td>
                  <td>{dateOnly(policy.expirationDate)}</td>
                  <td><StatusBadge status={policy.status} /></td>
                </tr>
              ))}
              {!data.policies.length && <tr><td colSpan={9} className="py-12! text-center text-[#86868b]">No policies match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

function Filter({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label><span className="mb-2 block text-[11px] font-semibold text-[#515154]">{label}</span><select className="field cursor-pointer" value={value} onChange={(event) => onChange(event.target.value)}>{children}</select></label>;
}

function StatusBadge({ status }: { status: InsurancePolicyStatus }) {
  const style = status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : status === "RENEWAL_DUE" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700";
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${style}`}>{statusLabels[status]}</span>;
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <div className="panel p-5 md:p-6"><div className="mb-5"><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-[#86868b]">{subtitle}</p></div><div className="h-[310px]">{children}</div></div>;
}
