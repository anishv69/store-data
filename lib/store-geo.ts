import { prisma } from "@/lib/prisma";
import type { GeoStore, GeoStoreStatus, StoreGeoResponse } from "@/types";

export function calculateGeoStatus(lowStockProducts: number, sales: number, averageSales: number): GeoStoreStatus {
  if (lowStockProducts >= 3) return "CRITICAL";
  if (lowStockProducts > 0) return "LOW_INVENTORY";
  if (averageSales && sales >= averageSales * 1.15) return "HIGH_PERFORMING";
  return "NORMAL";
}

export async function getStoreGeoData(): Promise<StoreGeoResponse> {
  const stores = await prisma.store.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
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
      name: store.name,
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
    summary: {
      stores: mappedStores.length,
      countries: new Set(mappedStores.map((store) => store.countryCode)).size,
      continents: new Set(mappedStores.map((store) => store.continent)).size,
      mappedSales: mappedStores.reduce((sum, store) => sum + store.sales, 0),
    },
  };
}
