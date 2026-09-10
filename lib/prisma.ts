import { PrismaClient } from "@prisma/client";

// Local development works without an .env file. Hosted environments can
// override this default with DATABASE_URL in their platform settings.
process.env.DATABASE_URL ??= "postgresql://retail_demo:retail_demo_password@localhost:5432/retail_analytics?schema=public";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
