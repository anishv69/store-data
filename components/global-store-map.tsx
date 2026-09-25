"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { GeoStore, GeoStoreStatus } from "@/types";
import { compactCurrency, currency } from "@/lib/format";

const statusColors: Record<GeoStoreStatus, string> = {
  HIGH_PERFORMING: "#34c759",
  NORMAL: "#0071e3",
  LOW_INVENTORY: "#ff9f0a",
  CRITICAL: "#ff3b30",
};

const statusLabels: Record<GeoStoreStatus, string> = {
  HIGH_PERFORMING: "High performing",
  NORMAL: "Normal",
  LOW_INVENTORY: "Low inventory",
  CRITICAL: "Critical inventory",
};

function MapController({ stores, focusedStore }: { stores: GeoStore[]; focusedStore: GeoStore | null }) {
  const map = useMap();

  useEffect(() => {
    if (focusedStore) {
      map.flyTo([focusedStore.latitude, focusedStore.longitude], 9, { duration: 0.8 });
      return;
    }
    if (stores.length === 1) {
      map.flyTo([stores[0].latitude, stores[0].longitude], 9, { duration: 0.8 });
      return;
    }
    if (stores.length > 1) {
      map.fitBounds(stores.map((store) => [store.latitude, store.longitude] as [number, number]), {
        padding: [34, 34],
        maxZoom: 6,
        animate: true,
      });
    }
  }, [focusedStore, map, stores]);

  return null;
}

export function GlobalStoreMap({ stores, scopeLabel }: { stores: GeoStore[]; scopeLabel: string }) {
  const [search, setSearch] = useState("");
  const [focusedId, setFocusedId] = useState<number | null>(null);
  const visibleStores = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return stores;
    return stores.filter((store) => [store.name, store.city, store.state, store.country, store.continent]
      .some((value) => value.toLowerCase().includes(term)));
  }, [search, stores]);
  const focusedStore = visibleStores.find((store) => store.id === focusedId) ?? null;

  useEffect(() => setFocusedId(null), [stores]);

  return (
    <section className="panel mt-5 overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-[#e8e8ed] p-5 md:flex-row md:items-end md:justify-between md:p-6">
        <div>
          <p className="text-sm font-semibold">Global store map</p>
          <p className="mt-1 text-xs text-[#86868b]">{visibleStores.length} of {stores.length} mapped stores in {scopeLabel}. Select a marker to open its analysis.</p>
        </div>
        <label className="w-full md:max-w-[310px]">
          <span className="mb-2 block text-[11px] font-semibold text-[#515154]">Find a store or location</span>
          <input className="field" value={search} onChange={(event) => { setSearch(event.target.value); setFocusedId(null); }} placeholder="Store, city, state, or country" />
        </label>
      </div>

      <div className="grid min-h-[560px] lg:grid-cols-[1fr_310px]">
        <div className="relative min-h-[430px] overflow-hidden bg-[#dbe8f4] lg:min-h-[560px]">
          <MapContainer center={[20, 0]} zoom={2} minZoom={2} maxZoom={18} scrollWheelZoom className="absolute inset-0 z-0 h-full w-full" worldCopyJump>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController stores={visibleStores} focusedStore={focusedStore} />
            {visibleStores.map((store) => {
              const color = statusColors[store.status];
              const radius = Math.min(12, Math.max(7, 7 + store.sales / 2_500_000));
              return (
                <CircleMarker
                  key={store.id}
                  center={[store.latitude, store.longitude]}
                  radius={radius}
                  pathOptions={{ color: "#ffffff", weight: 2, fillColor: color, fillOpacity: 0.92 }}
                  eventHandlers={{ click: () => setFocusedId(store.id) }}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>{store.name} · {store.city}</Tooltip>
                  <Popup minWidth={240}>
                    <div className="p-1 font-sans text-[#1d1d1f]">
                      <p className="text-[15px] font-semibold">{store.name}</p>
                      <p className="mt-1 text-xs text-[#6e6e73]">{store.city}, {store.state} · {store.country}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 border-y border-[#e8e8ed] py-3 text-xs">
                        <div><span className="block text-[10px] text-[#86868b]">Sales (USD)</span><strong>{compactCurrency(store.sales)}</strong></div>
                        <div><span className="block text-[10px] text-[#86868b]">Inventory</span><strong>{store.inventoryUnits.toLocaleString()}</strong></div>
                        <div><span className="block text-[10px] text-[#86868b]">Transactions</span><strong>{store.transactions.toLocaleString()}</strong></div>
                        <div><span className="block text-[10px] text-[#86868b]">Average order</span><strong>{currency(store.averageOrderValue)}</strong></div>
                      </div>
                      <p className="mt-3 text-[11px] text-[#6e6e73]">Manager: {store.managerName}</p>
                      <Link className="mt-3 inline-flex text-xs font-semibold text-[#0071e3]" href={`/executive-dashboard?level=store&value=${store.id}`}>Open store analysis →</Link>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
          {!visibleStores.length && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-sm text-[#6e6e73] backdrop-blur-sm">No mapped stores match this search.</div>}
        </div>

        <aside className="border-t border-[#e8e8ed] bg-white lg:border-t-0 lg:border-l">
          <div className="border-b border-[#e8e8ed] p-4">
            <p className="text-xs font-semibold">Store locator</p>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
              {Object.entries(statusLabels).map(([status, label]) => <span key={status} className="flex items-center gap-1.5 text-[10px] text-[#6e6e73]"><i className="size-2 rounded-full" style={{ backgroundColor: statusColors[status as GeoStoreStatus] }} />{label}</span>)}
            </div>
          </div>
          <div className="max-h-[330px] overflow-y-auto lg:max-h-[470px]">
            {visibleStores.slice(0, 60).map((store) => (
              <button type="button" key={store.id} onClick={() => setFocusedId(store.id)} className={`flex w-full cursor-pointer items-start gap-3 border-b border-[#f0f0f2] px-4 py-3 text-left transition hover:bg-[#f5f5f7] ${focusedId === store.id ? "bg-[#f0f7ff]" : ""}`}>
                <span className="mt-1.5 size-2.5 shrink-0 rounded-full ring-2 ring-white" style={{ backgroundColor: statusColors[store.status] }} />
                <span className="min-w-0 flex-1"><strong className="block truncate text-xs">{store.name}</strong><span className="mt-1 block truncate text-[10px] text-[#86868b]">{store.city}, {store.country}</span></span>
                <span className="text-[10px] font-semibold text-[#515154]">{compactCurrency(store.sales)}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
