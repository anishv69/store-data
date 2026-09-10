export type Session = { id: number; name: string; role: "STORE_MANAGER" | "REGIONAL_MANAGER"; storeId: number | null; region: string | null };

export type Product = { id: number; name: string; sku: string; category: string; price: number };
export type InventoryRow = { id: number; storeId: number; productId: number; quantity: number; updatedAt: string; product: Product };
export type TransactionRow = { id: number; storeId: number; productId: number; product: string; quantity: number; unitPrice: number; totalAmount: number; createdAt: string };
export type Store = { id: number; name: string; city: string; state: string; region: string; managerName: string };

export type StoreDashboard = {
  store: Store;
  todaySales: number;
  monthlySales: number;
  totalSales: number;
  transactionCount: number;
  inventoryUnits: number;
  lowStock: InventoryRow[];
  inventory: InventoryRow[];
  recentTransactions: TransactionRow[];
  topProducts: { name: string; sales: number; units: number }[];
  salesTrend: { day: string; sales: number }[];
};

export type RegionalDashboard = {
  region: string;
  totalSales: number;
  todaySales: number;
  transactionCount: number;
  storeCount: number;
  stores: (Store & { sales: number; transactions: number; inventory: number })[];
  salesTrend: { day: string; sales: number }[];
};
