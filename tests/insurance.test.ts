import assert from "node:assert/strict";
import test from "node:test";
import { InsuranceValidationError, parseInsuranceFilters } from "../lib/insurance";

test("parses optional insurance filters", () => {
  assert.deepEqual(
    parseInsuranceFilters(new URLSearchParams("category=Technology&requirement=CONTRACTUAL&status=ACTIVE")),
    { category: "Technology", requirement: "CONTRACTUAL", status: "ACTIVE" },
  );
});

test("normalizes blank insurance filters", () => {
  assert.deepEqual(parseInsuranceFilters(new URLSearchParams("category=%20&status=")), {
    category: undefined,
    requirement: undefined,
    status: undefined,
  });
});

test("rejects invalid insurance enum filters", () => {
  assert.throws(
    () => parseInsuranceFilters(new URLSearchParams("requirement=MANDATORY")),
    InsuranceValidationError,
  );
  assert.throws(
    () => parseInsuranceFilters(new URLSearchParams("status=UNKNOWN")),
    InsuranceValidationError,
  );
});
