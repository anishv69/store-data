import { prisma } from "@/lib/prisma";
import type { GeoStore, GeoStoreStatus, StoreGeoResponse } from "@/types";
import appleStoreSnapshot from "@/data/apple-stores.json";

export function calculateGeoStatus(lowStockProducts: number, sales: number, averageSales: number): GeoStoreStatus {
  if (lowStockProducts >= 3) return "CRITICAL";
  if (lowStockProducts > 0) return "LOW_INVENTORY";
  if (averageSales && sales >= averageSales * 1.15) return "HIGH_PERFORMING";
  return "NORMAL";
}

export async function getStoreGeoData(): Promise<StoreGeoResponse> {
  const stores = await prisma.store.findMany({
    where: { isOfficial: true, latitude: { not: null }, longitude: { not: null } },
    orderBy: [{ continent: "asc" }, { country: "asc" }, { city: "asc" }, { name: "asc" }],
  });
  const storeIds = stores.map((store) => store.id);

  const [salesRows, inventoryRows, lowStockRows] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["storeId"],
      where: { storeId: { in: storeIds } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.inventory.groupBy({
      by: ["storeId"],
      where: { storeId: { in: storeIds } },
      _sum: { quantity: true },
    }),
    prisma.inventory.groupBy({
      by: ["storeId"],
      where: { storeId: { in: storeIds }, quantity: { lte: 20 } },
      _count: true,
    }),
  ]);

  const salesMap = new Map(salesRows.map((row) => [row.storeId, { sales: Number(row._sum.totalAmount ?? 0), transactions: row._count }]));
  const inventoryMap = new Map(inventoryRows.map((row) => [row.storeId, row._sum.quantity ?? 0]));
  const lowStockMap = new Map(lowStockRows.map((row) => [row.storeId, row._count]));
  const averageSales = salesRows.length
    ? salesRows.reduce((sum, row) => sum + Number(row._sum.totalAmount ?? 0), 0) / salesRows.length
    : 0;

  const mappedStores: GeoStore[] = stores.map((store) => {
    const performance = salesMap.get(store.id) ?? { sales: 0, transactions: 0 };
    const lowStockProducts = lowStockMap.get(store.id) ?? 0;
    const status = calculateGeoStatus(lowStockProducts, performance.sales, averageSales);

    return {
      id: store.id,
      sourceUrl: store.sourceUrl ?? "",
      name: store.name,
      streetAddress: store.streetAddress ?? "",
      postalCode: store.postalCode ?? "",
      phone: store.phone ?? "",
      fullAddress: [store.streetAddress, store.city, store.state, store.postalCode, store.country].filter(Boolean).join(", "),
      city: store.city,
      state: store.state,
      region: store.region,
      company: store.company,
      area: store.area,
      countryGroup: store.countryGroup,
      stateGroup: store.stateGroup,
      market: store.market,
      managerName: store.managerName,
      country: store.country ?? "Unknown",
      countryCode: store.countryCode ?? "",
      continent: store.continent ?? "Unknown",
      latitude: Number(store.latitude),
      longitude: Number(store.longitude),
      timezone: store.timezone ?? "UTC",
      currency: store.currency ?? "USD",
      sales: performance.sales,
      transactions: performance.transactions,
      averageOrderValue: performance.transactions ? performance.sales / performance.transactions : 0,
      inventoryUnits: inventoryMap.get(store.id) ?? 0,
      lowStockProducts,
      status,
    };
  });

  return {
    stores: mappedStores,
    source: {
      label: appleStoreSnapshot.source,
      url: appleStoreSnapshot.sourceDirectory,
      generatedAt: appleStoreSnapshot.generatedAt,
      displayLanguage: appleStoreSnapshot.displayLanguage,
      localizationNote: appleStoreSnapshot.localizationNote,
    },
    summary: {
      stores: mappedStores.length,
      countries: new Set(mappedStores.map((store) => store.countryCode)).size,
      continents: new Set(mappedStores.map((store) => store.continent)).size,
      mappedSales: mappedStores.reduce((sum, store) => sum + store.sales, 0),
    },
  };
}
