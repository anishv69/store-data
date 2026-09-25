import {
  InsuranceFinancing,
  InsurancePolicyStatus,
  InsuranceRequirement,
  PrismaClient,
  Role,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const storeData = [
  { name: "Somerset Collection", city: "Troy", state: "Michigan", region: "Michigan", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Michigan", market: "Apple Detroit", managerName: "Olivia Chen" },
  { name: "Twelve Oaks Mall", city: "Novi", state: "Michigan", region: "Michigan", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Michigan", market: "Apple Detroit", managerName: "Marcus Reed" },
  { name: "Partridge Creek", city: "Clinton Township", state: "Michigan", region: "Michigan", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Michigan", market: "Apple Detroit", managerName: "Sophia Patel" },
  { name: "Ann Arbor", city: "Ann Arbor", state: "Michigan", region: "Michigan", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Michigan", market: "Apple Ann Arbor", managerName: "Ethan Brooks" },
  { name: "Woodland Mall", city: "Grand Rapids", state: "Michigan", region: "Michigan", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Michigan", market: "Apple Grand Rapids", managerName: "Maya Thompson" },
  { name: "Eastwood Towne Center", city: "Lansing", state: "Michigan", region: "Michigan", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Michigan", market: "Apple Lansing", managerName: "Noah Wilson" },
  { name: "Fifth Avenue", city: "New York", state: "New York", region: "New York", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple New York", market: "Apple New York City", managerName: "Ava Rodriguez" },
  { name: "SoHo", city: "New York", state: "New York", region: "New York", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple New York", market: "Apple New York City", managerName: "Liam Scott" },
  { name: "The Grove", city: "Los Angeles", state: "California", region: "California", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple California", market: "Apple Los Angeles", managerName: "Emma Garcia" },
  { name: "Union Square", city: "San Francisco", state: "California", region: "California", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple California", market: "Apple Bay Area", managerName: "Lucas Kim" },
  { name: "Eaton Centre", city: "Toronto", state: "Ontario", region: "Ontario", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple Canada", stateGroup: "Apple Ontario", market: "Apple Toronto", managerName: "Amelia Martin" },
  { name: "Pacific Centre", city: "Vancouver", state: "British Columbia", region: "British Columbia", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple Canada", stateGroup: "Apple British Columbia", market: "Apple Vancouver", managerName: "Benjamin Lee" },
  { name: "Downtown Detroit", city: "Detroit", state: "Michigan", region: "Michigan", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Michigan", market: "Apple Detroit", managerName: "Harper Davis" },
  { name: "NorthPark Center", city: "Dallas", state: "Texas", region: "Texas", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Texas", market: "Apple Dallas", managerName: "Elijah Martinez" },
  { name: "The Domain", city: "Austin", state: "Texas", region: "Texas", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Texas", market: "Apple Austin", managerName: "Isabella Clark" },
  { name: "Aventura", city: "Miami", state: "Florida", region: "Florida", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Florida", market: "Apple Miami", managerName: "James Lewis" },
  { name: "Florida Mall", city: "Orlando", state: "Florida", region: "Florida", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Florida", market: "Apple Orlando", managerName: "Charlotte Walker" },
  { name: "Michigan Avenue", city: "Chicago", state: "Illinois", region: "Illinois", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Illinois", market: "Apple Chicago", managerName: "Henry Hall" },
  { name: "University Village", city: "Seattle", state: "Washington", region: "Washington", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Washington", market: "Apple Seattle", managerName: "Mia Allen" },
  { name: "Boylston Street", city: "Boston", state: "Massachusetts", region: "Massachusetts", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Massachusetts", market: "Apple Boston", managerName: "Alexander Young" },
  { name: "Cherry Creek", city: "Denver", state: "Colorado", region: "Colorado", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Colorado", market: "Apple Denver", managerName: "Evelyn Hernandez" },
  { name: "Lenox Square", city: "Atlanta", state: "Georgia", region: "Georgia", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Georgia", market: "Apple Atlanta", managerName: "Daniel King" },
  { name: "Scottsdale Quarter", city: "Scottsdale", state: "Arizona", region: "Arizona", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Arizona", market: "Apple Phoenix", managerName: "Sofia Wright" },
  { name: "Tysons Corner", city: "McLean", state: "Virginia", region: "Virginia", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Virginia", market: "Apple Washington DC", managerName: "Jackson Lopez" },
  { name: "Short Hills", city: "Short Hills", state: "New Jersey", region: "New Jersey", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple New Jersey", market: "Apple North Jersey", managerName: "Camila Hill" },
  { name: "King of Prussia", city: "King of Prussia", state: "Pennsylvania", region: "Pennsylvania", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Pennsylvania", market: "Apple Philadelphia", managerName: "Sebastian Green" },
  { name: "Mall of America", city: "Bloomington", state: "Minnesota", region: "Minnesota", company: "Apple Inc", area: "Apple North America", countryGroup: "Apple USA", stateGroup: "Apple Minnesota", market: "Apple Minneapolis", managerName: "Luna Adams" },
];

const northAmericaGeo: Record<string, { country: string; countryCode: string; continent: string; latitude: number; longitude: number; timezone: string; currency: string }> = {
  "Somerset Collection": { country: "United States", countryCode: "US", continent: "North America", latitude: 42.5630, longitude: -83.1850, timezone: "America/Detroit", currency: "USD" },
  "Twelve Oaks Mall": { country: "United States", countryCode: "US", continent: "North America", latitude: 42.4880, longitude: -83.4750, timezone: "America/Detroit", currency: "USD" },
  "Partridge Creek": { country: "United States", countryCode: "US", continent: "North America", latitude: 42.6240, longitude: -82.9530, timezone: "America/Detroit", currency: "USD" },
  "Ann Arbor": { country: "United States", countryCode: "US", continent: "North America", latitude: 42.2808, longitude: -83.7430, timezone: "America/Detroit", currency: "USD" },
  "Woodland Mall": { country: "United States", countryCode: "US", continent: "North America", latitude: 42.9130, longitude: -85.5830, timezone: "America/Detroit", currency: "USD" },
  "Eastwood Towne Center": { country: "United States", countryCode: "US", continent: "North America", latitude: 42.7630, longitude: -84.5180, timezone: "America/Detroit", currency: "USD" },
  "Fifth Avenue": { country: "United States", countryCode: "US", continent: "North America", latitude: 40.7638, longitude: -73.9725, timezone: "America/New_York", currency: "USD" },
  "SoHo": { country: "United States", countryCode: "US", continent: "North America", latitude: 40.7250, longitude: -74.0000, timezone: "America/New_York", currency: "USD" },
  "The Grove": { country: "United States", countryCode: "US", continent: "North America", latitude: 34.0720, longitude: -118.3570, timezone: "America/Los_Angeles", currency: "USD" },
  "Union Square": { country: "United States", countryCode: "US", continent: "North America", latitude: 37.7880, longitude: -122.4070, timezone: "America/Los_Angeles", currency: "USD" },
  "Eaton Centre": { country: "Canada", countryCode: "CA", continent: "North America", latitude: 43.6540, longitude: -79.3800, timezone: "America/Toronto", currency: "CAD" },
  "Pacific Centre": { country: "Canada", countryCode: "CA", continent: "North America", latitude: 49.2830, longitude: -123.1190, timezone: "America/Vancouver", currency: "CAD" },
  "Downtown Detroit": { country: "United States", countryCode: "US", continent: "North America", latitude: 42.3310, longitude: -83.0460, timezone: "America/Detroit", currency: "USD" },
  "NorthPark Center": { country: "United States", countryCode: "US", continent: "North America", latitude: 32.8690, longitude: -96.7740, timezone: "America/Chicago", currency: "USD" },
  "The Domain": { country: "United States", countryCode: "US", continent: "North America", latitude: 30.4020, longitude: -97.7260, timezone: "America/Chicago", currency: "USD" },
  "Aventura": { country: "United States", countryCode: "US", continent: "North America", latitude: 25.9560, longitude: -80.1390, timezone: "America/New_York", currency: "USD" },
  "Florida Mall": { country: "United States", countryCode: "US", continent: "North America", latitude: 28.4460, longitude: -81.3960, timezone: "America/New_York", currency: "USD" },
  "Michigan Avenue": { country: "United States", countryCode: "US", continent: "North America", latitude: 41.8980, longitude: -87.6240, timezone: "America/Chicago", currency: "USD" },
  "University Village": { country: "United States", countryCode: "US", continent: "North America", latitude: 47.6640, longitude: -122.2980, timezone: "America/Los_Angeles", currency: "USD" },
  "Boylston Street": { country: "United States", countryCode: "US", continent: "North America", latitude: 42.3500, longitude: -71.0760, timezone: "America/New_York", currency: "USD" },
  "Cherry Creek": { country: "United States", countryCode: "US", continent: "North America", latitude: 39.7190, longitude: -104.9530, timezone: "America/Denver", currency: "USD" },
  "Lenox Square": { country: "United States", countryCode: "US", continent: "North America", latitude: 33.8460, longitude: -84.3620, timezone: "America/New_York", currency: "USD" },
  "Scottsdale Quarter": { country: "United States", countryCode: "US", continent: "North America", latitude: 33.6230, longitude: -111.9250, timezone: "America/Phoenix", currency: "USD" },
  "Tysons Corner": { country: "United States", countryCode: "US", continent: "North America", latitude: 38.9180, longitude: -77.2220, timezone: "America/New_York", currency: "USD" },
  "Short Hills": { country: "United States", countryCode: "US", continent: "North America", latitude: 40.7390, longitude: -74.3650, timezone: "America/New_York", currency: "USD" },
  "King of Prussia": { country: "United States", countryCode: "US", continent: "North America", latitude: 40.0880, longitude: -75.3910, timezone: "America/New_York", currency: "USD" },
  "Mall of America": { country: "United States", countryCode: "US", continent: "North America", latitude: 44.8540, longitude: -93.2420, timezone: "America/Chicago", currency: "USD" },
};

const globalStoreData = [
  { name: "Regent Street", city: "London", state: "England", region: "United Kingdom", company: "Apple Inc", area: "Apple Europe", countryGroup: "Apple United Kingdom", stateGroup: "Apple England", market: "Apple London", managerName: "Grace Taylor", country: "United Kingdom", countryCode: "GB", continent: "Europe", latitude: 51.5142, longitude: -0.1411, timezone: "Europe/London", currency: "GBP" },
  { name: "Covent Garden", city: "London", state: "England", region: "United Kingdom", company: "Apple Inc", area: "Apple Europe", countryGroup: "Apple United Kingdom", stateGroup: "Apple England", market: "Apple London", managerName: "Oliver Hughes", country: "United Kingdom", countryCode: "GB", continent: "Europe", latitude: 51.5127, longitude: -0.1238, timezone: "Europe/London", currency: "GBP" },
  { name: "Champs-Elysees", city: "Paris", state: "Ile-de-France", region: "France", company: "Apple Inc", area: "Apple Europe", countryGroup: "Apple France", stateGroup: "Apple Ile-de-France", market: "Apple Paris", managerName: "Camille Bernard", country: "France", countryCode: "FR", continent: "Europe", latitude: 48.8698, longitude: 2.3076, timezone: "Europe/Paris", currency: "EUR" },
  { name: "Kurfurstendamm", city: "Berlin", state: "Berlin", region: "Germany", company: "Apple Inc", area: "Apple Europe", countryGroup: "Apple Germany", stateGroup: "Apple Berlin", market: "Apple Berlin", managerName: "Leon Fischer", country: "Germany", countryCode: "DE", continent: "Europe", latitude: 52.5030, longitude: 13.3290, timezone: "Europe/Berlin", currency: "EUR" },
  { name: "Puerta del Sol", city: "Madrid", state: "Madrid", region: "Spain", company: "Apple Inc", area: "Apple Europe", countryGroup: "Apple Spain", stateGroup: "Apple Madrid", market: "Apple Madrid", managerName: "Lucia Romero", country: "Spain", countryCode: "ES", continent: "Europe", latitude: 40.4170, longitude: -3.7030, timezone: "Europe/Madrid", currency: "EUR" },
  { name: "Piazza Liberty", city: "Milan", state: "Lombardy", region: "Italy", company: "Apple Inc", area: "Apple Europe", countryGroup: "Apple Italy", stateGroup: "Apple Lombardy", market: "Apple Milan", managerName: "Matteo Conti", country: "Italy", countryCode: "IT", continent: "Europe", latitude: 45.4642, longitude: 9.1916, timezone: "Europe/Rome", currency: "EUR" },
  { name: "Marina Bay", city: "Singapore", state: "Singapore", region: "Singapore", company: "Apple Inc", area: "Apple Asia Pacific", countryGroup: "Apple Singapore", stateGroup: "Apple Singapore", market: "Apple Singapore", managerName: "Aiden Tan", country: "Singapore", countryCode: "SG", continent: "Asia", latitude: 1.2834, longitude: 103.8607, timezone: "Asia/Singapore", currency: "SGD" },
  { name: "Orchard Road", city: "Singapore", state: "Singapore", region: "Singapore", company: "Apple Inc", area: "Apple Asia Pacific", countryGroup: "Apple Singapore", stateGroup: "Apple Singapore", market: "Apple Singapore", managerName: "Chloe Lim", country: "Singapore", countryCode: "SG", continent: "Asia", latitude: 1.3048, longitude: 103.8318, timezone: "Asia/Singapore", currency: "SGD" },
  { name: "Marunouchi", city: "Tokyo", state: "Tokyo", region: "Japan", company: "Apple Inc", area: "Apple Asia Pacific", countryGroup: "Apple Japan", stateGroup: "Apple Tokyo", market: "Apple Tokyo", managerName: "Haruto Sato", country: "Japan", countryCode: "JP", continent: "Asia", latitude: 35.6814, longitude: 139.7645, timezone: "Asia/Tokyo", currency: "JPY" },
  { name: "Shibuya", city: "Tokyo", state: "Tokyo", region: "Japan", company: "Apple Inc", area: "Apple Asia Pacific", countryGroup: "Apple Japan", stateGroup: "Apple Tokyo", market: "Apple Tokyo", managerName: "Yui Nakamura", country: "Japan", countryCode: "JP", continent: "Asia", latitude: 35.6620, longitude: 139.6997, timezone: "Asia/Tokyo", currency: "JPY" },
  { name: "Mumbai BKC", city: "Mumbai", state: "Maharashtra", region: "India", company: "Apple Inc", area: "Apple Asia Pacific", countryGroup: "Apple India", stateGroup: "Apple Maharashtra", market: "Apple Mumbai", managerName: "Aarav Mehta", country: "India", countryCode: "IN", continent: "Asia", latitude: 19.0676, longitude: 72.8697, timezone: "Asia/Kolkata", currency: "INR" },
  { name: "Saket", city: "New Delhi", state: "Delhi", region: "India", company: "Apple Inc", area: "Apple Asia Pacific", countryGroup: "Apple India", stateGroup: "Apple Delhi", market: "Apple Delhi", managerName: "Ananya Sharma", country: "India", countryCode: "IN", continent: "Asia", latitude: 28.5286, longitude: 77.2195, timezone: "Asia/Kolkata", currency: "INR" },
  { name: "Pudong", city: "Shanghai", state: "Shanghai", region: "Greater China", company: "Apple Inc", area: "Apple Greater China", countryGroup: "Apple China", stateGroup: "Apple Shanghai", market: "Apple Shanghai", managerName: "Wei Zhang", country: "China", countryCode: "CN", continent: "Asia", latitude: 31.2353, longitude: 121.5020, timezone: "Asia/Shanghai", currency: "CNY" },
  { name: "Sanlitun", city: "Beijing", state: "Beijing", region: "Greater China", company: "Apple Inc", area: "Apple Greater China", countryGroup: "Apple China", stateGroup: "Apple Beijing", market: "Apple Beijing", managerName: "Mei Lin", country: "China", countryCode: "CN", continent: "Asia", latitude: 39.9338, longitude: 116.4541, timezone: "Asia/Shanghai", currency: "CNY" },
  { name: "Dubai Mall", city: "Dubai", state: "Dubai", region: "United Arab Emirates", company: "Apple Inc", area: "Apple Middle East", countryGroup: "Apple UAE", stateGroup: "Apple Dubai", market: "Apple Dubai", managerName: "Omar Hassan", country: "United Arab Emirates", countryCode: "AE", continent: "Asia", latitude: 25.1985, longitude: 55.2796, timezone: "Asia/Dubai", currency: "AED" },
  { name: "Yas Mall", city: "Abu Dhabi", state: "Abu Dhabi", region: "United Arab Emirates", company: "Apple Inc", area: "Apple Middle East", countryGroup: "Apple UAE", stateGroup: "Apple Abu Dhabi", market: "Apple Abu Dhabi", managerName: "Layla Mansour", country: "United Arab Emirates", countryCode: "AE", continent: "Asia", latitude: 24.4880, longitude: 54.6070, timezone: "Asia/Dubai", currency: "AED" },
  { name: "George Street", city: "Sydney", state: "New South Wales", region: "Australia", company: "Apple Inc", area: "Apple Asia Pacific", countryGroup: "Apple Australia", stateGroup: "Apple New South Wales", market: "Apple Sydney", managerName: "Jack Wilson", country: "Australia", countryCode: "AU", continent: "Oceania", latitude: -33.8692, longitude: 151.2067, timezone: "Australia/Sydney", currency: "AUD" },
  { name: "Melbourne Central", city: "Melbourne", state: "Victoria", region: "Australia", company: "Apple Inc", area: "Apple Asia Pacific", countryGroup: "Apple Australia", stateGroup: "Apple Victoria", market: "Apple Melbourne", managerName: "Ruby Evans", country: "Australia", countryCode: "AU", continent: "Oceania", latitude: -37.8100, longitude: 144.9627, timezone: "Australia/Melbourne", currency: "AUD" },
  { name: "Antara", city: "Mexico City", state: "Mexico City", region: "Mexico", company: "Apple Inc", area: "Apple Latin America", countryGroup: "Apple Mexico", stateGroup: "Apple Mexico City", market: "Apple Mexico City", managerName: "Santiago Cruz", country: "Mexico", countryCode: "MX", continent: "North America", latitude: 19.4390, longitude: -99.2010, timezone: "America/Mexico_City", currency: "MXN" },
  { name: "Morumbi", city: "Sao Paulo", state: "Sao Paulo", region: "Brazil", company: "Apple Inc", area: "Apple Latin America", countryGroup: "Apple Brazil", stateGroup: "Apple Sao Paulo", market: "Apple Sao Paulo", managerName: "Beatriz Silva", country: "Brazil", countryCode: "BR", continent: "South America", latitude: -23.6220, longitude: -46.6990, timezone: "America/Sao_Paulo", currency: "BRL" },
];

const allStoreData = [
  ...storeData.map((store) => ({ ...store, ...northAmericaGeo[store.name] })),
  ...globalStoreData,
];

const productData = [
  { name: "iPhone 17 Pro", sku: "IP17PRO", category: "Phone", price: 1099 },
  { name: "iPhone 17", sku: "IP17", category: "Phone", price: 899 },
  { name: "MacBook Pro", sku: "MBP", category: "Computer", price: 1999 },
  { name: "MacBook Air", sku: "MBA", category: "Computer", price: 1299 },
  { name: "iPad Pro", sku: "IPADPRO", category: "Tablet", price: 999 },
  { name: "Apple Watch", sku: "AW", category: "Wearable", price: 499 },
  { name: "AirPods Pro", sku: "APP", category: "Audio", price: 249 },
  { name: "AirPods Max", sku: "APM", category: "Audio", price: 549 },
  { name: "Vision Pro", sku: "VP", category: "Spatial", price: 3499 },
  { name: "Studio Display", sku: "SD", category: "Display", price: 1599 },
  { name: "HomePod mini", sku: "HPM", category: "Home", price: 99 },
  { name: "Apple TV 4K", sku: "ATV4K", category: "Home", price: 149 },
];

const insuranceData = [
  { policyCode: "DEMO-INS-001", coverageName: "Workers' Compensation", category: "People", requirement: InsuranceRequirement.STATUTORY, financing: InsuranceFinancing.HYBRID, geography: "United States", coverageLimit: 100_000_000, retainedAmount: 10_000_000, annualPremium: 8_400_000, renewalMonths: 8, description: "Statutory employee injury and employers' liability program." },
  { policyCode: "DEMO-INS-002", coverageName: "Unemployment Insurance", category: "People", requirement: InsuranceRequirement.STATUTORY, financing: InsuranceFinancing.STATE_PROGRAM, geography: "United States", coverageLimit: 25_000_000, retainedAmount: 0, annualPremium: 3_200_000, renewalMonths: 4, description: "Illustrative state payroll-based unemployment program." },
  { policyCode: "DEMO-INS-003", coverageName: "Commercial Auto", category: "Operations", requirement: InsuranceRequirement.STATUTORY, financing: InsuranceFinancing.COMMERCIAL, geography: "North America", coverageLimit: 50_000_000, retainedAmount: 2_500_000, annualPremium: 1_800_000, renewalMonths: 2, description: "Liability and physical damage for the corporate vehicle fleet." },
  { policyCode: "DEMO-INS-004", coverageName: "Directors & Officers", category: "Corporate", requirement: InsuranceRequirement.GOVERNANCE, financing: InsuranceFinancing.HYBRID, geography: "Worldwide", coverageLimit: 300_000_000, retainedAmount: 25_000_000, annualPremium: 12_500_000, renewalMonths: 7, description: "Management liability protection for directors and officers." },
  { policyCode: "DEMO-INS-005", coverageName: "Product Liability", category: "Hardware", requirement: InsuranceRequirement.RISK_MANAGEMENT, financing: InsuranceFinancing.HYBRID, geography: "Worldwide", coverageLimit: 500_000_000, retainedAmount: 50_000_000, annualPremium: 18_000_000, renewalMonths: 10, description: "Third-party bodily injury and property damage arising from products." },
  { policyCode: "DEMO-INS-006", coverageName: "Product Recall", category: "Hardware", requirement: InsuranceRequirement.RISK_MANAGEMENT, financing: InsuranceFinancing.COMMERCIAL, geography: "Worldwide", coverageLimit: 250_000_000, retainedAmount: 20_000_000, annualPremium: 9_800_000, renewalMonths: 5, description: "Illustrative recall, replacement, and crisis response costs." },
  { policyCode: "DEMO-INS-007", coverageName: "Marine, Cargo & Transit", category: "Supply chain", requirement: InsuranceRequirement.CONTRACTUAL, financing: InsuranceFinancing.COMMERCIAL, geography: "Worldwide", coverageLimit: 200_000_000, retainedAmount: 5_000_000, annualPremium: 6_400_000, renewalMonths: 9, description: "Goods in transit throughout the global supply chain." },
  { policyCode: "DEMO-INS-008", coverageName: "Cyber Liability", category: "Technology", requirement: InsuranceRequirement.RISK_MANAGEMENT, financing: InsuranceFinancing.HYBRID, geography: "Worldwide", coverageLimit: 600_000_000, retainedAmount: 75_000_000, annualPremium: 22_000_000, renewalMonths: 3, description: "First- and third-party cyber, privacy, and interruption exposure." },
  { policyCode: "DEMO-INS-009", coverageName: "Technology E&O", category: "Technology", requirement: InsuranceRequirement.CONTRACTUAL, financing: InsuranceFinancing.HYBRID, geography: "Worldwide", coverageLimit: 400_000_000, retainedAmount: 40_000_000, annualPremium: 15_500_000, renewalMonths: 6, description: "Technology services and professional liability coverage." },
  { policyCode: "DEMO-INS-010", coverageName: "General Liability", category: "Corporate", requirement: InsuranceRequirement.CONTRACTUAL, financing: InsuranceFinancing.HYBRID, geography: "Worldwide", coverageLimit: 250_000_000, retainedAmount: 10_000_000, annualPremium: 11_200_000, renewalMonths: 11, description: "Premises, operations, and advertising injury protection." },
  { policyCode: "DEMO-INS-011", coverageName: "Property & Business Interruption", category: "Property", requirement: InsuranceRequirement.RISK_MANAGEMENT, financing: InsuranceFinancing.HYBRID, geography: "Worldwide", coverageLimit: 1_000_000_000, retainedAmount: 100_000_000, annualPremium: 30_000_000, renewalMonths: 1, description: "Facilities, data centers, stores, and interruption exposures." },
  { policyCode: "DEMO-INS-012", coverageName: "Employment Practices Liability", category: "People", requirement: InsuranceRequirement.RISK_MANAGEMENT, financing: InsuranceFinancing.HYBRID, geography: "Worldwide", coverageLimit: 150_000_000, retainedAmount: 15_000_000, annualPremium: 7_100_000, renewalMonths: 8, description: "Employment-related claims and defense expenses." },
  { policyCode: "DEMO-INS-013", coverageName: "Crime & Fidelity", category: "Corporate", requirement: InsuranceRequirement.RISK_MANAGEMENT, financing: InsuranceFinancing.COMMERCIAL, geography: "Worldwide", coverageLimit: 100_000_000, retainedAmount: 5_000_000, annualPremium: 3_600_000, renewalMonths: 4, description: "Employee dishonesty, theft, and social engineering exposure." },
  { policyCode: "DEMO-INS-014", coverageName: "Umbrella & Excess Liability", category: "Corporate", requirement: InsuranceRequirement.CONTRACTUAL, financing: InsuranceFinancing.COMMERCIAL, geography: "Worldwide", coverageLimit: 750_000_000, retainedAmount: 0, annualPremium: 19_000_000, renewalMonths: 9, description: "Layered limits above primary liability programs." },
  { policyCode: "DEMO-INS-015", coverageName: "Multinational Controlled Master", category: "Global", requirement: InsuranceRequirement.CONTRACTUAL, financing: InsuranceFinancing.HYBRID, geography: "40+ countries", coverageLimit: 350_000_000, retainedAmount: 20_000_000, annualPremium: 14_000_000, renewalMonths: 6, description: "Master program coordinating admitted local policies." },
  { policyCode: "DEMO-INS-016", coverageName: "Environmental Liability", category: "Specialty", requirement: InsuranceRequirement.RISK_MANAGEMENT, financing: InsuranceFinancing.COMMERCIAL, geography: "Worldwide", coverageLimit: 125_000_000, retainedAmount: 10_000_000, annualPremium: 4_500_000, renewalMonths: 12, description: "Pollution and environmental cleanup exposures." },
  { policyCode: "DEMO-INS-017", coverageName: "Aviation", category: "Specialty", requirement: InsuranceRequirement.CONTRACTUAL, financing: InsuranceFinancing.COMMERCIAL, geography: "Worldwide", coverageLimit: 300_000_000, retainedAmount: 5_000_000, annualPremium: 5_800_000, renewalMonths: 2, description: "Corporate aircraft hull and liability coverage." },
  { policyCode: "DEMO-INS-018", coverageName: "Intellectual Property & Media", category: "Specialty", requirement: InsuranceRequirement.RISK_MANAGEMENT, financing: InsuranceFinancing.COMMERCIAL, geography: "Worldwide", coverageLimit: 200_000_000, retainedAmount: 25_000_000, annualPremium: 9_200_000, renewalMonths: 7, description: "Selected intellectual-property and media liability exposures." },
  { policyCode: "DEMO-INS-019", coverageName: "Political Risk & Trade Credit", category: "Global", requirement: InsuranceRequirement.RISK_MANAGEMENT, financing: InsuranceFinancing.COMMERCIAL, geography: "Selected countries", coverageLimit: 275_000_000, retainedAmount: 15_000_000, annualPremium: 8_700_000, renewalMonths: 10, description: "Political disruption and selected counterparty credit exposure." },
  { policyCode: "DEMO-INS-020", coverageName: "Travel Accident & Kidnap Response", category: "People", requirement: InsuranceRequirement.RISK_MANAGEMENT, financing: InsuranceFinancing.COMMERCIAL, geography: "Worldwide", coverageLimit: 75_000_000, retainedAmount: 1_000_000, annualPremium: 2_900_000, renewalMonths: 5, description: "Business travel accident and crisis response assistance." },
];

const startingStock = (storeIndex: number, productIndex: number) =>
  18 + ((storeIndex * 23 + productIndex * 17 + 31) % 128);

async function main() {
  if (process.env.SEED_RESET === "true") {
    await prisma.insurancePolicy.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.user.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
  }

  const stores = [];
  for (const item of allStoreData) {
    const existing = await prisma.store.findFirst({ where: { name: item.name } });
    stores.push(existing
      ? await prisma.store.update({ where: { id: existing.id }, data: item })
      : await prisma.store.create({ data: item }));
  }
  const products = [];
  for (const item of productData) {
    products.push(await prisma.product.upsert({ where: { sku: item.sku }, update: item, create: item }));
  }

  for (let s = 0; s < stores.length; s++) {
    for (let p = 0; p < products.length; p++) {
      await prisma.inventory.upsert({
        where: { storeId_productId: { storeId: stores[s].id, productId: products[p].id } },
        update: {},
        create: { storeId: stores[s].id, productId: products[p].id, quantity: startingStock(s, p) },
      });
    }
  }

  const password = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "store@demo.com" },
    update: { role: Role.STORE_MANAGER, storeId: stores[0].id, region: "Michigan", password },
    create: { name: "Olivia Chen", email: "store@demo.com", password, role: Role.STORE_MANAGER, storeId: stores[0].id, region: "Michigan" },
  });
  await prisma.user.upsert({
    where: { email: "regional@demo.com" },
    update: { role: Role.REGIONAL_MANAGER, region: "Michigan", password },
    create: { name: "Jordan Williams", email: "regional@demo.com", password, role: Role.REGIONAL_MANAGER, region: "Michigan" },
  });
  await prisma.user.upsert({
    where: { email: "cfo@demo.com" },
    update: { role: Role.EXECUTIVE, password },
    create: { name: "Taylor Morgan", email: "cfo@demo.com", password, role: Role.EXECUTIVE },
  });
  await prisma.user.upsert({
    where: { email: "store@apple.demo" },
    update: { role: Role.STORE_MANAGER, storeId: stores[0].id, region: "Michigan", password },
    create: { name: "Olivia Chen", email: "store@apple.demo", password, role: Role.STORE_MANAGER, storeId: stores[0].id, region: "Michigan" },
  });
  await prisma.user.upsert({
    where: { email: "regional@apple.demo" },
    update: { role: Role.REGIONAL_MANAGER, region: "Michigan", password },
    create: { name: "Jordan Williams", email: "regional@apple.demo", password, role: Role.REGIONAL_MANAGER, region: "Michigan" },
  });
  await prisma.user.upsert({
    where: { email: "cfo@apple.demo" },
    update: { role: Role.EXECUTIVE, password },
    create: { name: "Taylor Morgan", email: "cfo@apple.demo", password, role: Role.EXECUTIVE },
  });

  const policyToday = new Date();
  for (const item of insuranceData) {
    const effectiveDate = new Date(Date.UTC(policyToday.getUTCFullYear(), policyToday.getUTCMonth() - 6, 1));
    const expirationDate = new Date(Date.UTC(policyToday.getUTCFullYear(), policyToday.getUTCMonth() + item.renewalMonths, 1));
    const status = item.renewalMonths <= 2 ? InsurancePolicyStatus.RENEWAL_DUE : InsurancePolicyStatus.ACTIVE;
    const { renewalMonths: _renewalMonths, ...policy } = item;
    await prisma.insurancePolicy.upsert({
      where: { policyCode: item.policyCode },
      update: { ...policy, effectiveDate, expirationDate, status },
      create: { ...policy, company: "Apple Inc", effectiveDate, expirationDate, status },
    });
  }

  const minimumTransactionsPerStore = 260;
  const countsByStore = await prisma.transaction.groupBy({ by: ["storeId"], _count: true });
  const existingCountMap = new Map(countsByStore.map((row) => [row.storeId, row._count]));
  const now = new Date();
  const transactions = [];
  for (let storeIndex = 0; storeIndex < stores.length; storeIndex++) {
    const existingCount = existingCountMap.get(stores[storeIndex].id) ?? 0;
    const transactionTarget = minimumTransactionsPerStore + ((storeIndex * 47) % 181);
    for (let i = existingCount; i < transactionTarget; i++) {
      const ageInDays = (i * 11 + storeIndex * 7) % 180;
      const productIndex = (i * 5 + storeIndex * 3) % products.length;
      const createdAt = new Date(now);
      createdAt.setDate(now.getDate() - ageInDays);
      createdAt.setHours(9 + ((i + storeIndex) % 11), (i * 13 + storeIndex * 5) % 60, 0, 0);
      const quantity = 1 + ((i * 3 + productIndex + storeIndex) % 4);
      const unitPrice = productData[productIndex].price;
      transactions.push({ storeId: stores[storeIndex].id, productId: products[productIndex].id, quantity, unitPrice, totalAmount: unitPrice * quantity, createdAt });
    }
  }
  if (transactions.length) await prisma.transaction.createMany({ data: transactions });

  console.log(`Demo data ready: ${stores.length} stores, ${insuranceData.length} insurance policies, and at least ${minimumTransactionsPerStore} transactions per store.`);
}

main()
  .finally(() => prisma.$disconnect());
