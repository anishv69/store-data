"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ChevronRight, List, LocateFixed, Map as MapIcon, Navigation, PhoneCall, Search, SlidersHorizontal } from "lucide-react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { GeoStore, GeoStoreStatus, StoreGeoResponse } from "@/types";
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

type UserPosition = { latitude: number; longitude: number };

function distanceInMiles(origin: UserPosition, store: GeoStore) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = radians(store.latitude - origin.latitude);
  const longitudeDelta = radians(store.longitude - origin.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(origin.latitude)) * Math.cos(radians(store.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function MapController({ stores, focusedStore }: { stores: GeoStore[]; focusedStore: GeoStore | null }) {
  const map = useMap();

  useEffect(() => {
    if (focusedStore) {
      map.flyTo([focusedStore.latitude, focusedStore.longitude], 12, { duration: 0.8 });
      return;
    }
    if (stores.length === 1) {
      map.flyTo([stores[0].latitude, stores[0].longitude], 11, { duration: 0.8 });
      return;
    }
    if (stores.length > 1) {
      map.fitBounds(stores.map((store) => [store.latitude, store.longitude] as [number, number]), {
        padding: [42, 42],
        maxZoom: 6,
        animate: true,
      });
    }
  }, [focusedStore, map, stores]);

  return null;
}

const completeLocation = (store: GeoStore) => store.fullAddress || `${store.city}, ${store.state}, ${store.country}`;
const directionsUrl = (store: GeoStore) => `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
const phoneUrl = (store: GeoStore) => `tel:${store.phone.replace(/[^\d+]/g, "")}`;
const unitedStatesFirst = (left: GeoStore, right: GeoStore) => {
  if (left.country === "United States" && right.country !== "United States") return -1;
  if (right.country === "United States" && left.country !== "United States") return 1;
  return left.country.localeCompare(right.country)
    || left.state.localeCompare(right.state)
    || left.city.localeCompare(right.city)
    || left.name.localeCompare(right.name);
};

export function GlobalStoreMap({ stores, scopeLabel, source }: { stores: GeoStore[]; scopeLabel: string; source: StoreGeoResponse["source"] }) {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("ALL");
  const [status, setStatus] = useState<GeoStoreStatus | "ALL">("ALL");
  const [focusedId, setFocusedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [locationMessage, setLocationMessage] = useState("");

  const countries = useMemo(() => [...new Set(stores.map((store) => store.country))]
    .sort((left, right) => {
      if (left === "United States") return -1;
      if (right === "United States") return 1;
      return left.localeCompare(right);
    }), [stores]);
  const visibleStores = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = stores.filter((store) => {
      const matchesSearch = !term || [
        store.name,
        store.streetAddress,
        store.city,
        store.state,
        store.postalCode,
        store.country,
        store.continent,
      ].some((value) => value.toLowerCase().includes(term));
      return matchesSearch
        && (country === "ALL" || store.country === country)
        && (status === "ALL" || store.status === status);
    });
    return userPosition
      ? [...filtered].sort((left, right) => distanceInMiles(userPosition, left) - distanceInMiles(userPosition, right))
      : [...filtered].sort(unitedStatesFirst);
  }, [country, search, status, stores, userPosition]);

  const focusedStore = visibleStores.find((store) => store.id === focusedId) ?? null;
  const activeFilterCount = Number(country !== "ALL") + Number(status !== "ALL");
  const listedStores = visibleStores.slice(0, 100);

  useEffect(() => {
    setFocusedId(null);
    setSearch("");
    setCountry("ALL");
    setStatus("ALL");
    setUserPosition(null);
  }, [stores]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFocusedId(visibleStores[0]?.id ?? null);
    if (visibleStores.length) setViewMode("map");
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Location services are not available in this browser.");
      return;
    }
    setLocationMessage("Finding your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextPosition = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        const nearest = [...stores].sort((left, right) => distanceInMiles(nextPosition, left) - distanceInMiles(nextPosition, right))[0];
        setUserPosition(nextPosition);
        setFocusedId(nearest?.id ?? null);
        setLocationMessage(nearest ? `${nearest.name} is the nearest mapped store.` : "Location found.");
        setViewMode("map");
      },
      () => setLocationMessage("We could not access your location. Check your browser permission and try again."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  function clearFilters() {
    setSearch("");
    setCountry("ALL");
    setStatus("ALL");
    setFocusedId(null);
    setUserPosition(null);
    setLocationMessage("");
  }

  return (
    <section className="panel mt-5 overflow-hidden">
      <div className="border-b border-[#e8e8ed] bg-white px-5 py-6 md:px-7 md:py-8">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">Store locator</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1d1d1f] md:text-3xl">Find an Apple Store</h2>
          <p className="mt-2 text-sm leading-6 text-[#6e6e73]">Search all mapped stores in {scopeLabel}, browse their operating performance, or use your location to find the nearest one.</p>
        </div>

        <form onSubmit={submitSearch} className="mt-5 grid gap-3 lg:grid-cols-[minmax(280px,1fr)_auto_auto]">
          <label className="relative block">
            <span className="sr-only">Search by store or location</span>
            <Search aria-hidden="true" className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6e6e73]" />
            <input
              className="field h-12 pl-11"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setFocusedId(null); }}
              placeholder="Store name, city, state, country, or postal code"
            />
          </label>
          <button type="submit" className="btn-primary h-12 px-7">Search</button>
          <button type="button" onClick={useCurrentLocation} className="btn-secondary h-12 gap-2 px-5"><LocateFixed className="size-4" />Use my location</button>
        </form>
        {locationMessage && <p className="mt-2 text-xs text-[#6e6e73]" role="status">{locationMessage}</p>}

        <div className="mt-4 flex flex-col gap-3 border-t border-[#f0f0f2] pt-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#515154]"><SlidersHorizontal className="size-3.5" />Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}</span>
            <select aria-label="Filter by country" className="field h-9 w-auto min-w-36 py-1 text-xs" value={country} onChange={(event) => { setCountry(event.target.value); setFocusedId(null); }}>
              <option value="ALL">All countries</option>
              {countries.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
            <select aria-label="Filter by store status" className="field h-9 w-auto min-w-40 py-1 text-xs" value={status} onChange={(event) => { setStatus(event.target.value as GeoStoreStatus | "ALL"); setFocusedId(null); }}>
              <option value="ALL">All store statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
            {(search || activeFilterCount > 0 || userPosition) && <button type="button" onClick={clearFilters} className="px-2 py-2 text-xs font-semibold text-[#0071e3]">Clear</button>}
          </div>
          <div className="inline-flex w-fit rounded-full bg-[#f5f5f7] p-1 lg:hidden" aria-label="Choose map or list view">
            <button type="button" onClick={() => setViewMode("map")} aria-pressed={viewMode === "map"} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold ${viewMode === "map" ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#6e6e73]"}`}><MapIcon className="size-3.5" />Map</button>
            <button type="button" onClick={() => setViewMode("list")} aria-pressed={viewMode === "list"} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold ${viewMode === "list" ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#6e6e73]"}`}><List className="size-3.5" />List</button>
          </div>
        </div>
      </div>

      <div className="grid min-h-[620px] lg:grid-cols-[440px_1fr]">
        <aside className={`${viewMode === "list" ? "block" : "hidden"} border-[#e8e8ed] bg-white lg:block lg:border-r`}>
          <div className="flex items-center justify-between border-b border-[#e8e8ed] px-5 py-4">
            <div>
              <p className="text-sm font-semibold">{visibleStores.length.toLocaleString()} store{visibleStores.length === 1 ? "" : "s"}</p>
              <p className="mt-0.5 text-[10px] text-[#86868b]">{userPosition ? "Sorted by distance from you" : `Results in ${scopeLabel}`}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-x-2 gap-y-1">
              {Object.entries(statusLabels).map(([value, label]) => <span title={label} key={value} className="size-2 rounded-full" style={{ backgroundColor: statusColors[value as GeoStoreStatus] }} />)}
            </div>
          </div>

          <div className="max-h-[540px] overflow-y-auto">
            {listedStores.map((store) => {
              const distance = userPosition ? distanceInMiles(userPosition, store) : null;
              return (
                <article key={store.id} className={`border-b border-[#d2d2d7] px-6 py-7 transition md:px-7 ${focusedId === store.id ? "bg-[#f5f5f7] shadow-[inset_4px_0_0_#1d1d1f]" : "bg-white hover:bg-[#fafafa]"}`}>
                  <button type="button" onClick={() => { setFocusedId(store.id); setViewMode("map"); }} className="block w-full cursor-pointer text-left">
                    <span className="flex items-start justify-between gap-4">
                      <strong className="text-xl font-bold uppercase leading-tight tracking-[-0.02em] text-[#111111]">{store.name}</strong>
                      {distance !== null && <em className="shrink-0 text-lg font-medium leading-none text-[#111111]">{distance.toFixed(1)} mi</em>}
                    </span>
                    <span className="mt-4 block text-base uppercase leading-[1.35] text-[#1d1d1f]">
                      {store.streetAddress && <span className="block">{store.streetAddress}</span>}
                      <span className="block">{store.city}{store.state && store.state !== store.city ? `, ${store.state}` : ""}</span>
                      {store.postalCode && <span className="block">{store.postalCode}</span>}
                      <span className="block">{store.country}</span>
                    </span>
                  </button>

                  {store.phone && <a href={phoneUrl(store)} className="mt-3 inline-block text-lg font-bold text-[#111111] hover:underline">{store.phone}</a>}

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <a href={directionsUrl(store)} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2.5 bg-[#1d1d1f] px-4 py-3 text-sm font-bold text-white transition hover:bg-black"><Navigation className="size-5 fill-white" />Get Directions</a>
                    {store.phone && <a href={phoneUrl(store)} className="inline-flex min-h-12 items-center gap-2.5 bg-[#1d1d1f] px-4 py-3 text-sm font-bold text-white transition hover:bg-black"><PhoneCall className="size-5 fill-white" />Call</a>}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#e8e8ed] pt-4 text-xs text-[#515154]">
                    <span><strong className="block text-[10px] uppercase tracking-[0.08em] text-[#86868b]">Latitude</strong>{store.latitude.toFixed(6)}</span>
                    <span><strong className="block text-[10px] uppercase tracking-[0.08em] text-[#86868b]">Longitude</strong>{store.longitude.toFixed(6)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-[#86868b]">
                    <span><strong className="text-[#515154]">{compactCurrency(store.sales)}</strong> sales · {store.inventoryUnits.toLocaleString()} inventory units</span>
                    <span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ backgroundColor: statusColors[store.status] }} />{statusLabels[store.status]}</span>
                  </div>
                </article>
              );
            })}
            {!visibleStores.length && <div className="px-6 py-16 text-center"><p className="text-sm font-semibold">No stores found</p><p className="mt-2 text-xs leading-5 text-[#86868b]">Try another city, country, postal code, or clear the selected filters.</p><button type="button" onClick={clearFilters} className="mt-4 text-xs font-semibold text-[#0071e3]">Clear search and filters</button></div>}
            {visibleStores.length > listedStores.length && <p className="px-5 py-4 text-center text-[10px] text-[#86868b]">Showing the first {listedStores.length} results. Refine the search to find any of all {visibleStores.length} stores.</p>}
          </div>
        </aside>

        <div className={`${viewMode === "map" ? "block" : "hidden"} relative min-h-[500px] overflow-hidden bg-[#dbe8f4] lg:block lg:min-h-[620px]`}>
          <MapContainer center={[20, 0]} zoom={2} minZoom={2} maxZoom={18} scrollWheelZoom className="absolute inset-0 z-0 h-full w-full" worldCopyJump>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapController stores={visibleStores} focusedStore={focusedStore} />
            {userPosition && <CircleMarker center={[userPosition.latitude, userPosition.longitude]} radius={9} pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#1d1d1f", fillOpacity: 1 }}><Tooltip direction="top">Your location</Tooltip></CircleMarker>}
            {visibleStores.map((store, index) => {
              const selected = focusedId === store.id;
              const color = statusColors[store.status];
              return (
                <CircleMarker
                  key={store.id}
                  center={[store.latitude, store.longitude]}
                  radius={selected ? 12 : Math.min(10, Math.max(6, 6 + store.sales / 3_000_000))}
                  pathOptions={{ color: selected ? "#1d1d1f" : "#ffffff", weight: selected ? 3 : 2, fillColor: color, fillOpacity: 0.94 }}
                  eventHandlers={{ click: () => setFocusedId(store.id) }}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={0.96}>{index + 1}. {store.name} · {store.city}<br />Latitude: {store.latitude.toFixed(6)} · Longitude: {store.longitude.toFixed(6)}</Tooltip>
                  <Popup minWidth={290}>
                    <div className="p-1 font-sans text-[#1d1d1f]">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: color }}>{index + 1}</span>
                        <div><p className="text-[15px] font-semibold">{store.name}</p><p className="mt-1 text-xs leading-5 text-[#6e6e73]">{completeLocation(store)}</p></div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-[#f5f5f7] p-3 text-xs">
                        <div><span className="block text-[10px] text-[#86868b]">Sales</span><strong>{compactCurrency(store.sales)}</strong></div>
                        <div><span className="block text-[10px] text-[#86868b]">Inventory</span><strong>{store.inventoryUnits.toLocaleString()}</strong></div>
                        <div><span className="block text-[10px] text-[#86868b]">Transactions</span><strong>{store.transactions.toLocaleString()}</strong></div>
                        <div><span className="block text-[10px] text-[#86868b]">Average order</span><strong>{currency(store.averageOrderValue)}</strong></div>
                      </div>
                      <div className="mt-3 text-[10px] leading-4 text-[#86868b]"><p><strong>Latitude:</strong> {store.latitude.toFixed(6)}</p><p><strong>Longitude:</strong> {store.longitude.toFixed(6)}</p><p><strong>Timezone:</strong> {store.timezone}</p>{store.phone && <p><strong>Phone:</strong> {store.phone}</p>}</div>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#e8e8ed] pt-3">
                        <a href={directionsUrl(store)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0071e3]"><Navigation className="size-3" />Get directions</a>
                        <Link className="inline-flex items-center text-xs font-semibold text-[#0071e3]" href={`/executive-dashboard?level=store&value=${store.id}`}>Store analysis<ChevronRight className="size-3" /></Link>
                        {store.sourceUrl && <a className="text-xs font-semibold text-[#0071e3]" href={store.sourceUrl} target="_blank" rel="noreferrer">Apple listing</a>}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
          {!visibleStores.length && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/85 text-sm text-[#6e6e73] backdrop-blur-sm">No mapped stores match this search.</div>}
        </div>
      </div>

      <footer className="flex flex-col gap-1 border-t border-[#e8e8ed] bg-white px-5 py-3 text-[10px] text-[#86868b] md:flex-row md:items-center md:justify-between">
        <span>Source: <a href={source.url} target="_blank" rel="noreferrer" className="font-semibold text-[#0071e3]">Apple official store directory</a> · snapshot {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(source.generatedAt))} · English display</span>
        <span>{source.localizationNote}</span>
      </footer>
    </section>
  );
}
