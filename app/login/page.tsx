"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Store } from "lucide-react";

function dashboardFor(role: string) {
  if (role === "EXECUTIVE") return "/executive-dashboard";
  if (role === "REGIONAL_MANAGER") return "/regional-dashboard";
  return "/store-dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/session").then(async (response) => {
      const session = await response.json();
      if (session?.role) router.replace(dashboardFor(session.role));
    });
  }, [router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      router.push(dashboardFor(result.user.role));
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-black lg:block">
        <Image src="/images/login-devices.png" alt="An original studio composition of modern retail technology" fill priority sizes="54vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.05)_45%,rgba(0,0,0,.62))]" />
        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <p className="text-sm font-semibold text-[#80c7ff]">Retail Intelligence</p>
          <h2 className="mt-2 max-w-[620px] text-[52px] font-semibold leading-[.98] tracking-[-0.055em] text-white xl:text-[64px]">One view.<br />Every decision.</h2>
          <p className="mt-5 max-w-[500px] text-[17px] leading-6 text-white/72">Sales, inventory, and performance—beautifully connected from the company level to every store.</p>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[430px]">
          <div className="flex size-11 items-center justify-center rounded-[13px] bg-[#1d1d1f] text-white"><Store size={21} strokeWidth={1.8} /></div>
          <p className="mt-8 text-[13px] font-semibold text-[#0071e3]">Retail Intelligence</p>
          <h1 className="mt-2 text-[40px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#1d1d1f] sm:text-[48px]">Sign in to your workspace.</h1>
          <p className="mt-4 max-w-sm text-[15px] leading-6 text-[#6e6e73]">Your work email opens the right store, regional, or executive view automatically.</p>
          <form onSubmit={submit} className="mt-8 space-y-3">
            <label className="block">
              <span className="sr-only">Work email</span>
              <input autoFocus className="w-full rounded-[14px] border border-[#d2d2d7] bg-white px-4 py-4 text-base outline-none transition placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Work email" required />
            </label>
            <label className="relative block">
              <span className="sr-only">Password</span>
              <input className="w-full rounded-[14px] border border-[#d2d2d7] bg-white px-4 py-4 pr-12 text-base outline-none transition placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required />
              <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </label>
            {error && <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">{error}</div>}
            <button disabled={loading} className="btn-primary w-full py-4! text-base!">{loading ? <><Loader2 size={18} className="animate-spin" />Signing in</> : <>Continue <ArrowRight size={18} /></>}</button>
          </form>
          <div className="mt-7 rounded-[18px] bg-[#f5f5f7] p-4 text-xs leading-6 text-[#6e6e73]">
            <p><span className="font-semibold text-[#3b3b3d]">Demo emails:</span> cfo@apple.demo · regional@apple.demo · store@apple.demo</p>
            <p>Password: <span className="font-semibold text-[#3b3b3d]">password123</span></p>
          </div>
          <p className="mt-6 text-[11px] text-[#86868b]">Demonstration only. This product is not affiliated with Apple Inc.</p>
        </div>
      </section>
    </main>
  );
}
