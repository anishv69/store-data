import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { hasLocalScript, localizeStoreToEnglish } from "./store-english.mjs";

const snapshotPath = resolve("data/apple-stores.json");
const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
snapshot.stores = snapshot.stores.map(localizeStoreToEnglish);
snapshot.displayLanguage = "English";
snapshot.localizationNote = "Local-script official names and addresses are shown in English or Romanized form; official source URLs and coordinates are unchanged.";

const displayFields = ["name", "streetAddress", "city", "state", "country", "fullAddress"];
const remaining = snapshot.stores.filter((store) => displayFields.some((field) => hasLocalScript(store[field])));
if (remaining.length) {
  throw new Error(`${remaining.length} stores still contain non-English display scripts.`);
}

await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Normalized ${snapshot.stores.length} Apple Store records for English display.`);
