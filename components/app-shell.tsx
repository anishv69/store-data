"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Store, X } from "lucide-react";
import { useState } from "react";
import type { Session } from "@/types";

const storeLinks = [
  { href: "/store-dashboard", label: "Overview" },
  { href: "/inventory", label: "Inventory" },
  { href: "/transactions", label: "Transactions" },
];
const regionalLinks = [
  { href: "/regional-dashboard", label: "Overview" },
  { href: "/stores", label: "Stores" },
];
const executiveLinks = [{ href: "/executive-dashboard", label: "Executive Overview" }];

export function AppShell({ session, children }: { session: Session; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const links = session.role === "STORE_MANAGER" ? storeLinks : session.role === "REGIONAL_MANAGER" ? regionalLinks : executiveLinks;
  const role = session.role === "STORE_MANAGER" ? "Store Manager" : session.role === "REGIONAL_MANAGER" ? "Regional Manager" : "Chief Financial Officer";

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-12 max-w-[1240px] items-center px-5">
          <Link href={links[0].href} className="flex items-center gap-2 text-[13px] font-semibold tracking-[-0.01em]">
            <Store size={18} strokeWidth={1.9}/>
            <span>Retail Intelligence</span>
          </Link>
          <nav className="mx-auto hidden items-center gap-8 md:flex">
            {links.map((link) => {
              const active = pathname === link.href || (link.href === "/stores" && pathname.startsWith("/stores/"));
              return <Link key={link.href} href={link.href} className={`text-[12px] transition ${active ? "font-semibold text-black" : "text-[#525256] hover:text-black"}`}>{link.label}</Link>;
            })}
          </nav>
          <div className="ml-auto hidden items-center gap-3 md:flex">
            <div className="text-right"><p className="text-[11px] font-semibold leading-none">{session.name}</p><p className="mt-1 text-[9px] text-[#86868b]">{role}</p></div>
            <button onClick={logout} aria-label="Log out" className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-[#ededf0] text-[#424245] transition hover:bg-[#dedee2]"><LogOut size={14}/></button>
          </div>
          <button onClick={() => setOpen(!open)} aria-label="Toggle navigation" className="ml-auto md:hidden">{open ? <X size={19}/> : <Menu size={19}/>}</button>
        </div>
        {open && <div className="border-t border-black/5 bg-white px-5 py-5 md:hidden"><nav className="space-y-1">{links.map((link) => <Link onClick={() => setOpen(false)} key={link.href} href={link.href} className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-[#f5f5f7]">{link.label}</Link>)}</nav><div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4"><div className="text-xs"><span className="block font-semibold">{session.name}</span><span className="mt-1 block text-[#86868b]">{role}</span></div><button onClick={logout} className="text-xs font-semibold text-[#0071e3]">Sign out</button></div></div>}
      </header>
      <main className="mx-auto max-w-[1240px] px-5 py-8 md:px-7 md:py-12">{children}</main>
      <footer className="mx-auto max-w-[1240px] border-t border-black/10 px-5 py-6 text-[10px] text-[#86868b]">Demonstration analytics environment. Not affiliated with Apple Inc.</footer>
    </div>
  );
}
