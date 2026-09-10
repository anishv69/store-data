import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  const where = session.role === "STORE_MANAGER"
    ? { id: session.storeId ?? -1 }
    : session.role === "REGIONAL_MANAGER"
      ? { region: session.region ?? "" }
      : {};
  return NextResponse.json(await prisma.store.findMany({ where, orderBy: { name: "asc" } }));
}
