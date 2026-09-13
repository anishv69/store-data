import assert from "node:assert/strict";
import test from "node:test";
import {
  AggregationNotFoundError,
  AggregationValidationError,
  buildAggregationQuery,
  getSalesAggregation,
  mapAggregationRows,
  parseAggregationFilters,
} from "../lib/aggregations";

const overallRow = {
  dimension: "overall" as const,
  groupKey: null,
  totalRevenue: 1200,
  totalQuantity: 7,
  transactionCount: 3,
  averageTransactionAmount: 400,
  storeCount: 2,
  productCount: 2,
};

test("normalizes all optional filters and ignores blank values", () => {
  assert.deepEqual(parseAggregationFilters(new URLSearchParams("state= Michigan &city=Detroit&product=iPhone")), {
    state: "Michigan",
    city: "Detroit",
    product: "iPhone",
  });
  assert.deepEqual(parseAggregationFilters(new URLSearchParams("state=&city=%20%20")), {
    state: undefined,
    city: undefined,
    product: undefined,
  });
});

test("rejects overlong filters", () => {
  assert.throws(
    () => parseAggregationFilters(new URLSearchParams({ state: "x".repeat(101) })),
    AggregationValidationError,
  );
});

test("keeps filter values out of SQL text and binds them as parameters", () => {
  const hostile = "Michigan' OR 1=1 --";
  const query = buildAggregationQuery({ state: hostile, city: "Detroit", product: "iPhone" }, { region: "Michigan" });
  assert.equal(query.strings.join("").includes(hostile), false);
  assert.equal(query.values.includes(hostile), true);
  assert.equal(query.values.includes("Detroit"), true);
  assert.equal(query.values.includes("%iPhone%"), true);
  assert.equal(query.values.includes("Michigan"), true);
});

test("maps overall and chart breakdown metrics", () => {
  const result = mapAggregationRows([
    overallRow,
    { ...overallRow, dimension: "state", groupKey: "Michigan", totalRevenue: 900 },
    { ...overallRow, dimension: "city", groupKey: "Detroit", totalRevenue: 700 },
    { ...overallRow, dimension: "product", groupKey: "iPhone 17", totalRevenue: 500 },
  ], { state: "Michigan" });
  assert.equal(result.summary.totalRevenue, 1200);
  assert.equal(result.byState[0].label, "Michigan");
  assert.equal(result.byCity[0].label, "Detroit");
  assert.equal(result.byProduct[0].label, "iPhone 17");
  assert.deepEqual(result.filters, { state: "Michigan", city: null, product: null });
});

test("reports a no-match result", () => {
  assert.throws(() => mapAggregationRows([{ ...overallRow, transactionCount: 0 }], {}), AggregationNotFoundError);
});

test("service performs one aggregation query", async () => {
  let calls = 0;
  const result = await getSalesAggregation({ city: "Detroit" }, {}, async () => {
    calls += 1;
    return [overallRow];
  });
  assert.equal(calls, 1);
  assert.equal(result.summary.transactionCount, 3);
});
