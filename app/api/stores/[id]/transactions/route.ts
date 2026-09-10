import { NextResponse } from "next/server";
import { canAccessStore, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  const id = Number((await params).id);
  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) return NextResponse.json({ message: "Store not found." }, { status: 404 });
  if (!canAccessStore(session, id, store.region)) return NextResponse.json({ message: "You do not have access to this store." }, { status: 403 });
  const rows = await prisma.transaction.findMany({ where: { storeId: id }, include: { product: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows.map((row) => ({ ...row, product: row.product.name, unitPrice: Number(row.unitPrice), totalAmount: Number(row.totalAmount) })));
}
