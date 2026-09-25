import assert from "node:assert/strict";
import test from "node:test";
import { calculateGeoStatus } from "../lib/store-geo";

test("marks stores with three low-stock products as critical", () => {
  assert.equal(calculateGeoStatus(3, 2_000_000, 1_000_000), "CRITICAL");
});

test("inventory warnings take priority over high sales", () => {
  assert.equal(calculateGeoStatus(1, 2_000_000, 1_000_000), "LOW_INVENTORY");
});

test("identifies stores at least fifteen percent above average", () => {
  assert.equal(calculateGeoStatus(0, 1_150_000, 1_000_000), "HIGH_PERFORMING");
  assert.equal(calculateGeoStatus(0, 1_149_999, 1_000_000), "NORMAL");
});
