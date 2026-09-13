import { PrismaClient, Role } from "@prisma/client";
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

const startingStock = (storeIndex: number, productIndex: number) =>
  18 + ((storeIndex * 23 + productIndex * 17 + 31) % 128);

async function main() {
  if (process.env.SEED_RESET === "true") {
    await prisma.transaction.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.user.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
  }

  const stores = [];
  for (const item of storeData) {
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

  console.log(`Demo data ready: ${stores.length} stores with varied six-month history and at least ${minimumTransactionsPerStore} transactions each.`);
}

main()
  .finally(() => prisma.$disconnect());
