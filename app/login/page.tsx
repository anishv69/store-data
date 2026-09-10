"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Boxes, CheckCircle2, Eye, EyeOff, Loader2, Store } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("store@demo.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/session").then(async (response) => {
      if (response.ok) {
        const session = await response.json();
        if (session?.role) router.replace(session.role === "REGIONAL_MANAGER" ? "/regional-dashboard" : "/store-dashboard");
      }
    });
  }, [router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      router.push(result.user.role === "REGIONAL_MANAGER" ? "/regional-dashboard" : "/store-dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally { setLoading(false); }
  }

  function useDemo(role: "store" | "regional") {
    setEmail(`${role}@demo.com`); setPassword("password123"); setError("");
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden overflow-hidden bg-[#102a22] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-40 -top-40 size-[520px] rounded-full border border-white/10"/><div className="absolute -right-24 -top-24 size-[380px] rounded-full border border-white/10"/>
        <div className="relative flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-[#dff3ea] text-[#126c4e]"><Store size={23}/></span><div><p className="font-bold">Retail Analytics</p><p className="text-xs text-white/50">Operations intelligence</p></div></div>
        <div className="relative max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70"><span className="size-1.5 rounded-full bg-[#70d0ad]"/> One view. Every store.</div>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.045em] xl:text-6xl">Turn every sale into a clearer decision.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/58">Live inventory and sales visibility for store teams and regional leaders, connected in one focused workspace.</p>
        </div>
        <div className="relative grid grid-cols-3 gap-3">
          {[{ icon: Boxes, text: "Live inventory" }, { icon: BarChart3, text: "Sales insights" }, { icon: CheckCircle2, text: "Atomic updates" }].map(({ icon: Icon, text }) => <div key={text} className="rounded-xl border border-white/10 bg-white/5 p-4"><Icon className="mb-3 text-[#91d7bd]" size={19}/><p className="text-xs font-medium text-white/75">{text}</p></div>)}
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[430px] animate-rise">
          <div className="mb-9 lg:hidden"><span className="flex size-11 items-center justify-center rounded-xl bg-[#dff3ea] text-[#126c4e]"><Store /></span></div>
          <p className="eyebrow mb-3">Secure workspace</p>
          <h2 className="text-3xl font-bold tracking-[-0.035em]">Welcome back</h2>
          <p className="mt-2 text-sm text-[#68746f]">Sign in to access your operations dashboard.</p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => useDemo("store")} className={`rounded-xl border p-3 text-left transition ${email.startsWith("store") ? "border-[#126c4e] bg-[#edf6f2]" : "border-[#e1e6e3] hover:bg-[#f7f9f8]"}`}><span className="block text-xs font-bold">Store Manager</span><span className="mt-1 block text-[11px] text-[#748079]">Somerset</span></button>
            <button type="button" onClick={() => useDemo("regional")} className={`rounded-xl border p-3 text-left transition ${email.startsWith("regional") ? "border-[#126c4e] bg-[#edf6f2]" : "border-[#e1e6e3] hover:bg-[#f7f9f8]"}`}><span className="block text-xs font-bold">Regional Manager</span><span className="mt-1 block text-[11px] text-[#748079]">Michigan</span></button>
          </div>
          <form onSubmit={submit} className="mt-7 space-y-5">
            <label className="block"><span className="mb-2 block text-xs font-semibold text-[#46524c]">Email address</span><input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label className="block"><span className="mb-2 block text-xs font-semibold text-[#46524c]">Password</span><span className="relative block"><input className="field pr-11" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#87928d]">{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</div>}
            <button disabled={loading} className="btn-primary w-full py-3.5">{loading ? <><Loader2 size={17} className="animate-spin"/> Signing in</> : <>Sign in <ArrowRight size={17}/></>}</button>
          </form>
          <p className="mt-6 text-center text-[11px] leading-5 text-[#8a9590]">Demo environment · Use either account above<br/>This product is not affiliated with Apple.</p>
        </div>
      </section>
    </main>
  );
}
