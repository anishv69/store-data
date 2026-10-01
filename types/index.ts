export type Session = { id: number; name: string; role: "STORE_MANAGER" | "REGIONAL_MANAGER" | "EXECUTIVE"; storeId: number | null; region: string | null };

export type Product = { id: number; name: string; sku: string; category: string; price: number };
export type InventoryRow = { id: number; storeId: number; productId: number; quantity: number; updatedAt: string; product: Product };
export type TransactionRow = { id: number; storeId: number; productId: number; product: string; quantity: number; unitPrice: number; totalAmount: number; createdAt: string };
export type Store = { id: number; name: string; city: string; state: string; region: string; company: string; area: string; countryGroup: string; stateGroup: string; market: string; managerName: string };

export type GeoStoreStatus = "HIGH_PERFORMING" | "NORMAL" | "LOW_INVENTORY" | "CRITICAL";
export type GeoStore = {
  id: number;
  sourceUrl: string;
  name: string;
  streetAddress: string;
  postalCode: string;
  phone: string;
  fullAddress: string;
  city: string;
  state: string;
  region: string;
  company: string;
  area: string;
  countryGroup: string;
  stateGroup: string;
  market: string;
  managerName: string;
  country: string;
  countryCode: string;
  continent: string;
  latitude: number;
  longitude: number;
  timezone: string;
  currency: string;
  sales: number;
  transactions: number;
  averageOrderValue: number;
  inventoryUnits: number;
  lowStockProducts: number;
  status: GeoStoreStatus;
};

export type StoreGeoResponse = {
  stores: GeoStore[];
  source: {
    label: string;
    url: string;
    generatedAt: string;
    displayLanguage: string;
    localizationNote: string;
  };
  summary: {
    stores: number;
    countries: number;
    continents: number;
    mappedSales: number;
  };
};

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
export type CityComparison = { city: string; state: string; region: string; sales: number; transactions: number; averageOrderValue: number; inventory: number; storeCount: number };

export type AggregationFilters = { state?: string; city?: string; product?: string };
export type AggregationMetrics = {
  totalRevenue: number;
  totalQuantity: number;
  transactionCount: number;
  averageTransactionAmount: number;
  storeCount: number;
  productCount: number;
};
export type AggregationBreakdown = AggregationMetrics & { key: string; label: string };
export type AggregationResponse = {
  filters: { state: string | null; city: string | null; product: string | null };
  summary: AggregationMetrics;
  byState: AggregationBreakdown[];
  byCity: AggregationBreakdown[];
  byProduct: AggregationBreakdown[];
};

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
  cityComparison: CityComparison[];
  storeComparison: StoreComparison[];
};

export type InsuranceRequirement = "STATUTORY" | "CONTRACTUAL" | "GOVERNANCE" | "RISK_MANAGEMENT";
export type InsuranceFinancing = "CAPTIVE" | "COMMERCIAL" | "HYBRID" | "STATE_PROGRAM";
export type InsurancePolicyStatus = "ACTIVE" | "RENEWAL_DUE" | "EXPIRED";

export type InsurancePolicy = {
  id: number;
  policyCode: string;
  company: string;
  coverageName: string;
  category: string;
  requirement: InsuranceRequirement;
  financing: InsuranceFinancing;
  geography: string;
  coverageLimit: number;
  retainedAmount: number;
  annualPremium: number;
  effectiveDate: string;
  expirationDate: string;
  status: InsurancePolicyStatus;
  description: string;
};

export type InsuranceDashboard = {
  filters: {
    category: string | null;
    requirement: InsuranceRequirement | null;
    status: InsurancePolicyStatus | null;
  };
  options: {
    categories: string[];
    requirements: InsuranceRequirement[];
    statuses: InsurancePolicyStatus[];
  };
  summary: {
    policyCount: number;
    activePolicies: number;
    renewalDue: number;
    totalCoverageLimit: number;
    totalRetainedAmount: number;
    totalAnnualPremium: number;
  };
  byCategory: { name: string; policies: number; coverageLimit: number; annualPremium: number }[];
  byRequirement: { name: InsuranceRequirement; policies: number; coverageLimit: number; annualPremium: number }[];
  policies: InsurancePolicy[];
};
