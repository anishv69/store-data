import assert from "node:assert/strict";
import test from "node:test";
import snapshot from "../data/apple-stores.json";

test("official store snapshot is internally complete", () => {
  assert.equal(snapshot.storeCount, snapshot.stores.length);
  assert.equal(snapshot.countryCount, new Set(snapshot.stores.map((store) => store.countryCode)).size);
  assert.ok(snapshot.stores.length >= 500);
  assert.equal(snapshot.failures.length, 0);
  assert.equal(snapshot.displayLanguage, "English");
});

test("all map-facing store fields use English-compatible script", () => {
  const localScript = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Thai}\p{Script=Arabic}\p{Script=Cyrillic}]/u;
  const fields = ["name", "streetAddress", "city", "state", "country", "fullAddress"] as const;
  for (const store of snapshot.stores) {
    for (const field of fields) {
      assert.equal(localScript.test(store[field]), false, `${store.sourceId} has non-English ${field}`);
    }
  }
});

test("every official store has a unique source, address, and valid coordinates", () => {
  assert.equal(new Set(snapshot.stores.map((store) => store.sourceId)).size, snapshot.stores.length);
  for (const store of snapshot.stores) {
    assert.ok(store.sourceUrl.startsWith("https://"));
    assert.ok(store.streetAddress.length > 0, `${store.sourceId} is missing its street address`);
    assert.ok(store.fullAddress.includes(store.country), `${store.sourceId} is missing its complete location`);
    assert.ok(store.latitude >= -90 && store.latitude <= 90, `${store.sourceId} has an invalid latitude`);
    assert.ok(store.longitude >= -180 && store.longitude <= 180, `${store.sourceId} has an invalid longitude`);
    assert.ok(store.timezone.includes("/"), `${store.sourceId} is missing its timezone`);
  }
});
