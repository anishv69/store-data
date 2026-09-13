import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AggregationBreakdown, AggregationFilters, AggregationMetrics, AggregationResponse } from "@/types";

export type AggregationScope = { region?: string; storeId?: number };

type RawAggregationRow = {
  dimension: "overall" | "state" | "city" | "product";
  groupKey: string | null;
  totalRevenue: Prisma.Decimal | number | string | null;
  totalQuantity: bigint | number | string | null;
  transactionCount: bigint | number | string;
  averageTransactionAmount: Prisma.Decimal | number | string | null;
  storeCount: bigint | number | string;
  productCount: bigint | number | string;
};

export class AggregationValidationError extends Error {}
export class AggregationNotFoundError extends Error {}

const MAX_FILTER_LENGTH = 100;

function normalizeFilter(name: string, value: string | null) {
  const normalized = value?.trim();
  if (!normalized) return undefined;
  if (normalized.length > MAX_FILTER_LENGTH) {
    throw new AggregationValidationError(`${name} must be ${MAX_FILTER_LENGTH} characters or fewer.`);
  }
  return normalized;
}

export function parseAggregationFilters(search: URLSearchParams): AggregationFilters {
  return {
    state: normalizeFilter("state", search.get("state")),
    city: normalizeFilter("city", search.get("city")),
    product: normalizeFilter("product", search.get("product")),
  };
}

export function buildAggregationQuery(filters: AggregationFilters, scope: AggregationScope) {
  const conditions: Prisma.Sql[] = [];
  if (scope.region) conditions.push(Prisma.sql`s."region" = ${scope.region}`);
  if (scope.storeId !== undefined) conditions.push(Prisma.sql`s."id" = ${scope.storeId}`);
  if (filters.state) conditions.push(Prisma.sql`LOWER(s."state") = LOWER(${filters.state})`);
  if (filters.city) conditions.push(Prisma.sql`LOWER(s."city") = LOWER(${filters.city})`);
  if (filters.product) conditions.push(Prisma.sql`p."name" ILIKE ${`%${filters.product}%`}`);
  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.empty;

  return Prisma.sql`
    SELECT
      CASE
        WHEN GROUPING(s."state") = 0 THEN 'state'
        WHEN GROUPING(s."city") = 0 THEN 'city'
        WHEN GROUPING(p."id") = 0 THEN 'product'
        ELSE 'overall'
      END AS "dimension",
      CASE
        WHEN GROUPING(s."state") = 0 THEN s."state"
        WHEN GROUPING(s."city") = 0 THEN s."city"
        WHEN GROUPING(p."id") = 0 THEN p."name"
        ELSE NULL
      END AS "groupKey",
      COALESCE(SUM(t."totalAmount"), 0) AS "totalRevenue",
      COALESCE(SUM(t."quantity"), 0) AS "totalQuantity",
      COUNT(*) AS "transactionCount",
      COALESCE(AVG(t."totalAmount"), 0) AS "averageTransactionAmount",
      COUNT(DISTINCT t."storeId") AS "storeCount",
      COUNT(DISTINCT t."productId") AS "productCount"
    FROM "Transaction" t
    INNER JOIN "Store" s ON s."id" = t."storeId"
    INNER JOIN "Product" p ON p."id" = t."productId"
    ${where}
    GROUP BY GROUPING SETS (
      (),
      (s."state"),
      (s."city"),
      (p."id", p."name")
    )
    ORDER BY "dimension", "totalRevenue" DESC, "groupKey" ASC
  `;
}

const numberValue = (value: Prisma.Decimal | bigint | number | string | null) => Number(value ?? 0);

function metrics(row: RawAggregationRow): AggregationMetrics {
  return {
    totalRevenue: numberValue(row.totalRevenue),
    totalQuantity: numberValue(row.totalQuantity),
    transactionCount: numberValue(row.transactionCount),
    averageTransactionAmount: numberValue(row.averageTransactionAmount),
    storeCount: numberValue(row.storeCount),
    productCount: numberValue(row.productCount),
  };
}

export function mapAggregationRows(rows: RawAggregationRow[], filters: AggregationFilters): AggregationResponse {
  const overall = rows.find((row) => row.dimension === "overall");
  if (!overall || numberValue(overall.transactionCount) === 0) {
    throw new AggregationNotFoundError("No transactions match the supplied filters.");
  }

  const breakdown = (dimension: RawAggregationRow["dimension"]): AggregationBreakdown[] => rows
    .filter((row) => row.dimension === dimension && row.groupKey)
    .map((row) => ({ key: row.groupKey!, label: row.groupKey!, ...metrics(row) }));

  return {
    filters: {
      state: filters.state ?? null,
      city: filters.city ?? null,
      product: filters.product ?? null,
    },
    summary: metrics(overall),
    byState: breakdown("state"),
    byCity: breakdown("city"),
    byProduct: breakdown("product"),
  };
}

type ExecuteAggregationQuery = (query: Prisma.Sql) => Promise<RawAggregationRow[]>;

const executeAggregationQuery: ExecuteAggregationQuery = (query) => prisma.$queryRaw<RawAggregationRow[]>(query);

export async function getSalesAggregation(
  filters: AggregationFilters,
  scope: AggregationScope,
  execute: ExecuteAggregationQuery = executeAggregationQuery,
) {
  const rows = await execute(buildAggregationQuery(filters, scope));
  return mapAggregationRows(rows, filters);
}
