export type Session = { id: number; name: string; role: "STORE_MANAGER" | "REGIONAL_MANAGER" | "EXECUTIVE"; storeId: number | null; region: string | null };

export type Product = { id: number; name: string; sku: string; category: string; price: number };
export type InventoryRow = { id: number; storeId: number; productId: number; quantity: number; updatedAt: string; product: Product };
export type TransactionRow = { id: number; storeId: number; productId: number; product: string; quantity: number; unitPrice: number; totalAmount: number; createdAt: string };
export type Store = { id: number; name: string; city: string; state: string; region: string; company: string; area: string; countryGroup: string; stateGroup: string; market: string; managerName: string };

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
  salesTrend: { day: string; sales: number; previousSales: number }[];
  peerStores?: (Store & { sales: number; transactions: number; inventory: number })[];
};

export type RegionalDashboard = {
  region: string;
  totalSales: number;
  todaySales: number;
  transactionCount: number;
  storeCount: number;
  stores: (Store & { sales: number; transactions: number; inventory: number })[];
  salesTrend: { day: string; sales: number; previousSales: number }[];
};

export type HierarchyLevel = "company" | "area" | "countryGroup" | "stateGroup" | "market";
export type ExecutiveLevel = HierarchyLevel | "store";
export type ExecutiveOption = { level: ExecutiveLevel; value: string; label: string; group: string };
export type RegionComparison = { name: string; sales: number; transactions: number; averageOrderValue: number; inventory: number; storeCount: number };
export type StoreComparison = { id: number; name: string; city: string; state: string; region: string; sales: number; transactions: number; averageOrderValue: number; inventory: number };

export type ExecutiveDashboard = {
  level: ExecutiveLevel;
  label: string;
  nextLevel: ExecutiveLevel | null;
  breadcrumbs: { level: ExecutiveLevel; label: string }[];
  totalSales: number;
  todaySales: number;
  transactionCount: number;
  inventoryUnits: number;
  storeCount: number;
  children: { name: string; level: HierarchyLevel | "store"; storeId?: number; sales: number; transactions: number; inventory: number; storeCount: number }[];
  salesTrend: { day: string; sales: number; previousSales: number }[];
  topProducts: { name: string; sales: number; units: number }[];
  options: ExecutiveOption[];
  regionComparison: RegionComparison[];
  storeComparison: StoreComparison[];
};
