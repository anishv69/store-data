"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Building2, MapPin, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LoadingScreen } from "@/components/loading-screen";
import { useSession } from "@/components/use-session";
import type { Store } from "@/types";

export default function StoresPage() {
  const { session, loading } = useSession("REGIONAL_MANAGER");
  const [stores, setStores] = useState<Store[] | null>(null);
  useEffect(() => { if (session) fetch("/api/stores").then((r) => r.json()).then(setStores); }, [session]);
  if (loading || !session || !stores) return <LoadingScreen label="Loading stores"/>;
  return <AppShell session={session}><div className="mb-7"><p className="eyebrow mb-2">Regional network</p><h1 className="page-title">Stores</h1><p className="muted mt-1.5">{stores.length} locations in the {session.region} region.</p></div><div className="grid gap-4 md:grid-cols-2">{stores.map((store) => <Link href={`/stores/${store.id}`} key={store.id} className="panel group p-5 transition hover:-translate-y-0.5 hover:border-[#c9d9d2] hover:shadow-md"><div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-xl bg-[#edf5f1] text-[#126c4e]"><Building2 size={20}/></span><span className="flex size-8 items-center justify-center rounded-full bg-[#f3f5f4] text-[#728079] transition group-hover:bg-[#126c4e] group-hover:text-white"><ArrowRight size={15}/></span></div><h2 className="mt-5 text-lg font-bold">{store.name}</h2><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#68746f]"><span className="flex items-center gap-1.5"><MapPin size={14}/>{store.city}, {store.state}</span><span className="flex items-center gap-1.5"><UserRound size={14}/>{store.managerName}</span></div></Link>)}</div></AppShell>;
}
