import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ExecutiveOption, HierarchyLevel } from "@/types";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const trendWindowStart = () => new Date(Date.now() - 168 * 86400000);

function buildWeeklyTrend(rows: { createdAt: Date; totalAmount: Prisma.Decimal }[]) {
  const thisWeek = new Date();
  thisWeek.setHours(0, 0, 0, 0);
  thisWeek.setDate(thisWeek.getDate() - ((thisWeek.getDay() + 6) % 7));

  return Array.from({ length: 12 }, (_, index) => {
    const start = new Date(thisWeek);
    start.setDate(thisWeek.getDate() - (11 - index) * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const previousStart = new Date(start);
    previousStart.setDate(start.getDate() - 84);
    const previousEnd = new Date(end);
    previousEnd.setDate(end.getDate() - 84);
    const sum = (from: Date, to: Date) => rows
      .filter((row) => row.createdAt >= from && row.createdAt < to)
      .reduce((total, row) => total + Number(row.totalAmount), 0);

    return {
      day: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(start),
      sales: sum(start, end),
      previousSales: sum(previousStart, previousEnd),
    };
  });
}

export async function getStoreDashboard(storeId: number) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return null;

  const [today, month, all, inventory, recent, productSales, trendRows] = await Promise.all([
    prisma.transaction.aggregate({ where: { storeId, createdAt: { gte: startOfToday() } }, _sum: { totalAmount: true } }),
    prisma.transaction.aggregate({ where: { storeId, createdAt: { gte: startOfMonth() } }, _sum: { totalAmount: true } }),
    prisma.transaction.aggregate({ where: { storeId }, _sum: { totalAmount: true }, _count: true }),
    prisma.inventory.findMany({ where: { storeId }, include: { product: true }, orderBy: { quantity: "asc" } }),
    prisma.transaction.findMany({ where: { storeId }, include: { product: true }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.transaction.groupBy({ by: ["productId"], where: { storeId }, _sum: { totalAmount: true, quantity: true }, orderBy: { _sum: { totalAmount: "desc" } }, take: 5 }),
    prisma.transaction.findMany({ where: { storeId, createdAt: { gte: trendWindowStart() } }, select: { totalAmount: true, createdAt: true } }),
  ]);

  const productIds = productSales.map((p) => p.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p.name]));
  const salesTrend = buildWeeklyTrend(trendRows);

  return {
    store,
    todaySales: Number(today._sum.totalAmount ?? 0),
    monthlySales: Number(month._sum.totalAmount ?? 0),
    totalSales: Number(all._sum.totalAmount ?? 0),
    transactionCount: all._count,
    inventoryUnits: inventory.reduce((sum, row) => sum + row.quantity, 0),
    lowStock: inventory.filter((row) => row.quantity <= 20),
    inventory: inventory.map((row) => ({ ...row, product: { ...row.product, price: Number(row.product.price) } })),
    recentTransactions: recent.map((row) => ({ ...row, unitPrice: Number(row.unitPrice), totalAmount: Number(row.totalAmount), product: row.product.name })),
    topProducts: productSales.map((row) => ({ name: productMap.get(row.productId) ?? "Product", sales: Number(row._sum.totalAmount ?? 0), units: row._sum.quantity ?? 0 })),
    salesTrend,
  };
}

export async function getRegionalDashboard(region: string) {
  const stores = await prisma.store.findMany({ where: { region } });
  const storeIds = stores.map((store) => store.id);
  const [totals, today, salesByStore, countsByStore, inventories, trendRows] = await Promise.all([
    prisma.transaction.aggregate({ where: { storeId: { in: storeIds } }, _sum: { totalAmount: true }, _count: true }),
    prisma.transaction.aggregate({ where: { storeId: { in: storeIds }, createdAt: { gte: startOfToday() } }, _sum: { totalAmount: true } }),
    prisma.transaction.groupBy({ by: ["storeId"], where: { storeId: { in: storeIds } }, _sum: { totalAmount: true } }),
    prisma.transaction.groupBy({ by: ["storeId"], where: { storeId: { in: storeIds } }, _count: true }),
    prisma.inventory.groupBy({ by: ["storeId"], where: { storeId: { in: storeIds } }, _sum: { quantity: true } }),
    prisma.transaction.findMany({ where: { storeId: { in: storeIds }, createdAt: { gte: trendWindowStart() } }, select: { totalAmount: true, createdAt: true } }),
  ]);
  const salesMap = new Map(salesByStore.map((row) => [row.storeId, Number(row._sum.totalAmount ?? 0)]));
  const countMap = new Map(countsByStore.map((row) => [row.storeId, row._count]));
  const inventoryMap = new Map(inventories.map((row) => [row.storeId, row._sum.quantity ?? 0]));

  const salesTrend = buildWeeklyTrend(trendRows);

  return {
    region,
    totalSales: Number(totals._sum.totalAmount ?? 0),
    todaySales: Number(today._sum.totalAmount ?? 0),
    transactionCount: totals._count,
    storeCount: stores.length,
    stores: stores.map((store) => ({ ...store, sales: salesMap.get(store.id) ?? 0, transactions: countMap.get(store.id) ?? 0, inventory: inventoryMap.get(store.id) ?? 0 })),
    salesTrend,
  };
}

export async function getExecutiveComparisons() {
  const stores = await prisma.store.findMany({ orderBy: [{ region: "asc" }, { name: "asc" }] });
  const storeIds = stores.map((store) => store.id);
  const [salesRows, inventoryRows] = await Promise.all([
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
  ]);

  const salesMap = new Map(salesRows.map((row) => [row.storeId, { sales: Number(row._sum.totalAmount ?? 0), transactions: row._count }]));
  const inventoryMap = new Map(inventoryRows.map((row) => [row.storeId, row._sum.quantity ?? 0]));
  const storeComparison = stores.map((store) => {
    const performance = salesMap.get(store.id) ?? { sales: 0, transactions: 0 };
    return {
      id: store.id,
      name: store.name,
      city: store.city,
      state: store.state,
      region: store.region,
      sales: performance.sales,
      transactions: performance.transactions,
      averageOrderValue: performance.transactions ? performance.sales / performance.transactions : 0,
      inventory: inventoryMap.get(store.id) ?? 0,
    };
  }).sort((a, b) => b.sales - a.sales);

  const regions = new Map<string, typeof storeComparison>();
  for (const store of storeComparison) regions.set(store.region, [...(regions.get(store.region) ?? []), store]);
  const regionComparison = [...regions.entries()].map(([name, regionStores]) => {
    const sales = regionStores.reduce((sum, store) => sum + store.sales, 0);
    const transactions = regionStores.reduce((sum, store) => sum + store.transactions, 0);
    return {
      name,
      sales,
      transactions,
      averageOrderValue: transactions ? sales / transactions : 0,
      inventory: regionStores.reduce((sum, store) => sum + store.inventory, 0),
      storeCount: regionStores.length,
    };
  }).sort((a, b) => b.sales - a.sales);

  return { regionComparison, storeComparison };
}

const hierarchyLevels: HierarchyLevel[] = ["company", "area", "countryGroup", "stateGroup", "market"];

export async function getExecutiveOptions(): Promise<ExecutiveOption[]> {
  const stores = await prisma.store.findMany({ orderBy: { name: "asc" } });
  const definitions: { level: HierarchyLevel; group: string }[] = [
    { level: "company", group: "Company" },
    { level: "area", group: "Geography" },
    { level: "countryGroup", group: "Country" },
    { level: "stateGroup", group: "State" },
    { level: "market", group: "Market" },
  ];
  const options: ExecutiveOption[] = [];
  for (const definition of definitions) {
    const values = [...new Set(stores.map((store) => String(store[definition.level])))];
    options.push(...values.map((label) => ({ level: definition.level, value: label, label, group: definition.group })));
  }
  options.push(...stores.map((store) => ({ level: "store" as const, value: String(store.id), label: store.name, group: "Store" })));
  return options;
}

export async function getExecutiveDashboard(level: HierarchyLevel, value: string) {
  const levelIndex = hierarchyLevels.indexOf(level);
  if (levelIndex === -1) return null;
  const nextLevel: HierarchyLevel | "store" = levelIndex === hierarchyLevels.length - 1
    ? "store"
    : hierarchyLevels[levelIndex + 1];
  const where = { [level]: value } as Prisma.StoreWhereInput;
  const stores = await prisma.store.findMany({ where, orderBy: { name: "asc" } });
  if (!stores.length) return null;
  const storeIds = stores.map((store) => store.id);

  const [totals, today, salesByStore, countsByStore, inventories, trendRows, productSales] = await Promise.all([
    prisma.transaction.aggregate({ where: { storeId: { in: storeIds } }, _sum: { totalAmount: true }, _count: true }),
    prisma.transaction.aggregate({ where: { storeId: { in: storeIds }, createdAt: { gte: startOfToday() } }, _sum: { totalAmount: true } }),
    prisma.transaction.groupBy({ by: ["storeId"], where: { storeId: { in: storeIds } }, _sum: { totalAmount: true } }),
    prisma.transaction.groupBy({ by: ["storeId"], where: { storeId: { in: storeIds } }, _count: true }),
    prisma.inventory.groupBy({ by: ["storeId"], where: { storeId: { in: storeIds } }, _sum: { quantity: true } }),
    prisma.transaction.findMany({ where: { storeId: { in: storeIds }, createdAt: { gte: trendWindowStart() } }, select: { totalAmount: true, createdAt: true } }),
    prisma.transaction.groupBy({ by: ["productId"], where: { storeId: { in: storeIds } }, _sum: { totalAmount: true, quantity: true }, orderBy: { _sum: { totalAmount: "desc" } }, take: 5 }),
  ]);

  const salesMap = new Map(salesByStore.map((row) => [row.storeId, Number(row._sum.totalAmount ?? 0)]));
  const countMap = new Map(countsByStore.map((row) => [row.storeId, row._count]));
  const inventoryMap = new Map(inventories.map((row) => [row.storeId, row._sum.quantity ?? 0]));
  const productIds = productSales.map((row) => row.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((product) => [product.id, product.name]));

  const childGroups = new Map<string, typeof stores>();
  for (const store of stores) {
    const childName = nextLevel === "store" ? store.name : String(store[nextLevel]);
    childGroups.set(childName, [...(childGroups.get(childName) ?? []), store]);
  }

  const children = [...childGroups.entries()].map(([name, childStores]) => ({
    name,
    level: nextLevel,
    storeId: nextLevel === "store" ? childStores[0].id : undefined,
    sales: childStores.reduce((sum, store) => sum + (salesMap.get(store.id) ?? 0), 0),
    transactions: childStores.reduce((sum, store) => sum + (countMap.get(store.id) ?? 0), 0),
    inventory: childStores.reduce((sum, store) => sum + (inventoryMap.get(store.id) ?? 0), 0),
    storeCount: childStores.length,
  })).sort((a, b) => b.sales - a.sales);

  const salesTrend = buildWeeklyTrend(trendRows);

  const sample = stores[0];
  return {
    level,
    label: String(sample[level]),
    nextLevel,
    breadcrumbs: hierarchyLevels.slice(0, levelIndex + 1).map((item) => ({ level: item, label: String(sample[item]) })),
    totalSales: Number(totals._sum.totalAmount ?? 0),
    todaySales: Number(today._sum.totalAmount ?? 0),
    transactionCount: totals._count,
    inventoryUnits: [...inventoryMap.values()].reduce((sum, quantity) => sum + quantity, 0),
    storeCount: stores.length,
    children,
    salesTrend,
    topProducts: productSales.map((row) => ({ name: productMap.get(row.productId) ?? "Product", sales: Number(row._sum.totalAmount ?? 0), units: row._sum.quantity ?? 0 })),
  };
}
