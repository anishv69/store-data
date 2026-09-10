import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const storeData = [
  { name: "Somerset Collection", city: "Troy", state: "Michigan", region: "Michigan", managerName: "Olivia Chen" },
  { name: "Twelve Oaks Mall", city: "Novi", state: "Michigan", region: "Michigan", managerName: "Marcus Reed" },
  { name: "Partridge Creek", city: "Clinton Township", state: "Michigan", region: "Michigan", managerName: "Sophia Patel" },
  { name: "Ann Arbor", city: "Ann Arbor", state: "Michigan", region: "Michigan", managerName: "Ethan Brooks" },
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
];

const stock = [
  [100, 120, 40, 55, 60, 80, 150, 12],
  [88, 105, 31, 47, 52, 74, 132, 27],
  [64, 91, 24, 38, 44, 63, 118, 18],
  [72, 98, 29, 43, 49, 69, 126, 22],
];

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();

  const stores = [];
  for (const item of storeData) stores.push(await prisma.store.create({ data: item }));
  const products = [];
  for (const item of productData) products.push(await prisma.product.create({ data: item }));

  for (let s = 0; s < stores.length; s++) {
    for (let p = 0; p < products.length; p++) {
      await prisma.inventory.create({ data: { storeId: stores[s].id, productId: products[p].id, quantity: stock[s][p] } });
    }
  }

  const password = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: { name: "Olivia Chen", email: "store@demo.com", password, role: Role.STORE_MANAGER, storeId: stores[0].id, region: "Michigan" },
  });
  await prisma.user.create({
    data: { name: "Jordan Williams", email: "regional@demo.com", password, role: Role.REGIONAL_MANAGER, region: "Michigan" },
  });

  const now = new Date();
  for (let i = 0; i < 44; i++) {
    const storeIndex = i % stores.length;
    const productIndex = (i * 3 + storeIndex) % products.length;
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - (i % 27));
    createdAt.setHours(9 + (i % 10), (i * 7) % 60, 0, 0);
    const quantity = (i % 4) + 1;
    const unitPrice = productData[productIndex].price;
    await prisma.transaction.create({
      data: { storeId: stores[storeIndex].id, productId: products[productIndex].id, quantity, unitPrice, totalAmount: unitPrice * quantity, createdAt },
    });
  }
}

main()
  .then(() => console.log("Seeded 2 users, 4 stores, 8 products, 32 inventories, and 44 transactions."))
  .finally(() => prisma.$disconnect());
