import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  if (session.role !== "STORE_MANAGER") return NextResponse.json({ success: false, message: "Only store managers can complete sales." }, { status: 403 });

  try {
    const body = await request.json();
    const storeId = Number(body.storeId);
    const productId = Number(body.productId);
    const quantity = Number(body.quantity);
    if (!Number.isInteger(storeId) || storeId <= 0) return NextResponse.json({ success: false, message: "Unknown store." }, { status: 400 });
    if (!Number.isInteger(productId) || productId <= 0) return NextResponse.json({ success: false, message: "Unknown product." }, { status: 400 });
    if (!Number.isInteger(quantity) || quantity <= 0) return NextResponse.json({ success: false, message: "Quantity must be a positive whole number." }, { status: 400 });
    if (session.storeId !== storeId) return NextResponse.json({ success: false, message: "You can only sell inventory from your assigned store." }, { status: 403 });

    const result = await prisma.$transaction(async (tx) => {
      const store = await tx.store.findUnique({ where: { id: storeId } });
      if (!store) throw new SaleError("Unknown store.", 404);
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new SaleError("Unknown product.", 404);
      const inventory = await tx.inventory.findUnique({ where: { storeId_productId: { storeId, productId } } });
      if (!inventory) throw new SaleError(`${product.name} is not carried at this store.`, 404);

      // The conditional update makes concurrent sales safe: only one request can claim the remaining units.
      const updated = await tx.inventory.updateMany({ where: { id: inventory.id, quantity: { gte: quantity } }, data: { quantity: { decrement: quantity } } });
      if (updated.count === 0) {
        const latest = await tx.inventory.findUnique({ where: { id: inventory.id } });
        throw new SaleError(`Only ${latest?.quantity ?? 0} units of ${product.name} are currently available.`, 409);
      }
      const totalAmount = new Prisma.Decimal(product.price).mul(quantity);
      const sale = await tx.transaction.create({ data: { storeId, productId, quantity, unitPrice: product.price, totalAmount } });
      const remaining = await tx.inventory.findUniqueOrThrow({ where: { id: inventory.id } });
      return { sale, product, remainingInventory: remaining.quantity };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({
      success: true,
      transactionId: result.sale.id,
      product: result.product.name,
      quantity: result.sale.quantity,
      unitPrice: Number(result.sale.unitPrice),
      totalAmount: Number(result.sale.totalAmount),
      remainingInventory: result.remainingInventory,
    });
  } catch (error) {
    if (error instanceof SaleError) return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    console.error("Sale failed", error);
    return NextResponse.json({ success: false, message: "The sale could not be completed. No inventory was changed." }, { status: 500 });
  }
}

class SaleError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}
