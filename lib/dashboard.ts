import { prisma } from "@/lib/prisma";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

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
    prisma.transaction.findMany({ where: { storeId, createdAt: { gte: new Date(Date.now() - 6 * 86400000) } }, select: { totalAmount: true, createdAt: true } }),
  ]);

  const productIds = productSales.map((p) => p.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p.name]));
  const salesTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - i));
    const next = new Date(date.getTime() + 86400000);
    return {
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      sales: trendRows.filter((r) => r.createdAt >= date && r.createdAt < next).reduce((sum, r) => sum + Number(r.totalAmount), 0),
    };
  });

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
    prisma.transaction.findMany({ where: { storeId: { in: storeIds }, createdAt: { gte: new Date(Date.now() - 6 * 86400000) } }, select: { totalAmount: true, createdAt: true } }),
  ]);
  const salesMap = new Map(salesByStore.map((row) => [row.storeId, Number(row._sum.totalAmount ?? 0)]));
  const countMap = new Map(countsByStore.map((row) => [row.storeId, row._count]));
  const inventoryMap = new Map(inventories.map((row) => [row.storeId, row._sum.quantity ?? 0]));

  const salesTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - i));
    const next = new Date(date.getTime() + 86400000);
    return { day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date), sales: trendRows.filter((r) => r.createdAt >= date && r.createdAt < next).reduce((sum, r) => sum + Number(r.totalAmount), 0) };
  });

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
