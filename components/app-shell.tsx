"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Boxes, Building2, ChevronRight, LayoutDashboard, LogOut, Menu, ReceiptText, Store, X } from "lucide-react";
import { useState } from "react";
import type { Session } from "@/types";

const storeLinks = [
  { href: "/store-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/transactions", label: "Transactions", icon: ReceiptText },
];
const regionalLinks = [
  { href: "/regional-dashboard", label: "Regional Dashboard", icon: BarChart3 },
  { href: "/stores", label: "Stores", icon: Building2 },
];

export function AppShell({ session, children }: { session: Session; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const links = session.role === "STORE_MANAGER" ? storeLinks : regionalLinks;

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const sidebar = (
    <aside className="flex h-full w-[260px] flex-col bg-[#102a22] px-4 py-5 text-white">
      <div className="flex items-center gap-3 px-2 pb-8">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#daf1e7] text-[#126c4e]"><Store size={21} strokeWidth={2.2} /></div>
        <div><p className="text-sm font-bold tracking-tight">Retail Analytics</p><p className="text-[11px] text-white/55">Operations workspace</p></div>
      </div>
      <div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Workspace</div>
      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href === "/stores" && pathname.startsWith("/stores/"));
          return <Link onClick={() => setOpen(false)} key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/6 hover:text-white"}`}><Icon size={18} /><span>{label}</span>{active && <ChevronRight className="ml-auto" size={15} />}</Link>;
        })}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#d9ede5] text-xs font-bold text-[#126c4e]">{session.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold">{session.name}</p><p className="truncate text-[11px] text-white/45">{session.role === "STORE_MANAGER" ? "Store Manager" : "Regional Manager"}</p></div>
        </div>
        <button onClick={logout} className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/6 hover:text-white"><LogOut size={17} /> Log out</button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f5f7f6] lg:pl-[260px]">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {open && <div className="fixed inset-0 z-40 bg-black/35 lg:hidden" onClick={() => setOpen(false)}><div className="h-full w-[260px]" onClick={(event) => event.stopPropagation()}>{sidebar}</div><button aria-label="Close navigation" onClick={() => setOpen(false)} className="absolute right-4 top-4 text-white"><X /></button></div>}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e6ebe8] bg-white/90 px-5 backdrop-blur-md lg:px-8">
        <button aria-label="Open navigation" onClick={() => setOpen(true)} className="text-[#34423c] lg:hidden"><Menu /></button>
        <div className="hidden items-center gap-2 text-xs text-[#7b8781] lg:flex"><span>{session.role === "STORE_MANAGER" ? "Store Operations" : `${session.region} Region`}</span><ChevronRight size={13} /><span className="font-semibold text-[#34423c]">Live overview</span></div>
        <div className="ml-auto flex items-center gap-2"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60"/><span className="relative inline-flex size-2 rounded-full bg-emerald-500"/></span><span className="text-xs font-medium text-[#68746f]">Data live</span></div>
      </header>
      <main className="mx-auto max-w-[1500px] p-5 md:p-8">{children}</main>
    </div>
  );
}
