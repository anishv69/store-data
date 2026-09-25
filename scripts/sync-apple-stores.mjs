import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import tzlookup from "tz-lookup";
import { localizeStoreToEnglish } from "./store-english.mjs";

const directories = [
  { code: "US", country: "United States", continent: "North America", area: "Apple North America", currency: "USD", url: "https://www.apple.com/retail/storelist/" },
  { code: "AE", country: "United Arab Emirates", continent: "Asia", area: "Apple Middle East", currency: "AED", url: "https://www.apple.com/ae/retail/storelist/" },
  { code: "AT", country: "Austria", continent: "Europe", area: "Apple Europe", currency: "EUR", url: "https://www.apple.com/at/retail/storelist/" },
  { code: "AU", country: "Australia", continent: "Oceania", area: "Apple Asia Pacific", currency: "AUD", url: "https://www.apple.com/au/retail/storelist/" },
  { code: "BE", country: "Belgium", continent: "Europe", area: "Apple Europe", currency: "EUR", url: "https://www.apple.com/benl/retail/storelist/" },
  { code: "BR", country: "Brazil", continent: "South America", area: "Apple Latin America", currency: "BRL", url: "https://www.apple.com/br/retail/storelist/" },
  { code: "CA", country: "Canada", continent: "North America", area: "Apple North America", currency: "CAD", url: "https://www.apple.com/ca/retail/storelist/" },
  { code: "CH", country: "Switzerland", continent: "Europe", area: "Apple Europe", currency: "CHF", url: "https://www.apple.com/chde/retail/storelist/" },
  { code: "CN", country: "China", continent: "Asia", area: "Apple Greater China", currency: "CNY", url: "https://www.apple.com.cn/retail/storelist/" },
  { code: "DE", country: "Germany", continent: "Europe", area: "Apple Europe", currency: "EUR", url: "https://www.apple.com/de/retail/storelist/" },
  { code: "ES", country: "Spain", continent: "Europe", area: "Apple Europe", currency: "EUR", url: "https://www.apple.com/es/retail/storelist/" },
  { code: "FR", country: "France", continent: "Europe", area: "Apple Europe", currency: "EUR", url: "https://www.apple.com/fr/retail/storelist/" },
  { code: "HK", country: "Hong Kong", continent: "Asia", area: "Apple Greater China", currency: "HKD", url: "https://www.apple.com/hk/en/retail/storelist/" },
  { code: "IN", country: "India", continent: "Asia", area: "Apple Asia Pacific", currency: "INR", url: "https://www.apple.com/in/retail/storelist/" },
  { code: "IT", country: "Italy", continent: "Europe", area: "Apple Europe", currency: "EUR", url: "https://www.apple.com/it/retail/storelist/" },
  { code: "JP", country: "Japan", continent: "Asia", area: "Apple Asia Pacific", currency: "JPY", url: "https://www.apple.com/jp/retail/storelist/" },
  { code: "KR", country: "South Korea", continent: "Asia", area: "Apple Asia Pacific", currency: "KRW", url: "https://www.apple.com/kr/retail/storelist/" },
  { code: "MO", country: "Macao", continent: "Asia", area: "Apple Greater China", currency: "MOP", url: "https://www.apple.com/mo-en/retail/storelist/" },
  { code: "MX", country: "Mexico", continent: "North America", area: "Apple Latin America", currency: "MXN", url: "https://www.apple.com/mx/retail/storelist/" },
  { code: "MY", country: "Malaysia", continent: "Asia", area: "Apple Asia Pacific", currency: "MYR", url: "https://www.apple.com/my/retail/storelist/" },
  { code: "NL", country: "Netherlands", continent: "Europe", area: "Apple Europe", currency: "EUR", url: "https://www.apple.com/nl/retail/storelist/" },
  { code: "SE", country: "Sweden", continent: "Europe", area: "Apple Europe", currency: "SEK", url: "https://www.apple.com/se/retail/storelist/" },
  { code: "SG", country: "Singapore", continent: "Asia", area: "Apple Asia Pacific", currency: "SGD", url: "https://www.apple.com/sg/retail/storelist/" },
  { code: "TH", country: "Thailand", continent: "Asia", area: "Apple Asia Pacific", currency: "THB", url: "https://www.apple.com/th/retail/storelist/" },
  { code: "TR", country: "Türkiye", continent: "Asia", area: "Apple Middle East", currency: "TRY", url: "https://www.apple.com/tr/retail/storelist/" },
  { code: "TW", country: "Taiwan", continent: "Asia", area: "Apple Greater China", currency: "TWD", url: "https://www.apple.com/tw/retail/storelist/" },
  { code: "GB", country: "United Kingdom", continent: "Europe", area: "Apple Europe", currency: "GBP", url: "https://www.apple.com/uk/retail/storelist/" },
];

const sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

async function fetchText(url, attempt = 1) {
  const response = await fetch(url, { headers: { "user-agent": "RetailAnalyticsDemo/1.0 (+educational data snapshot)" } });
  if (response.ok) return response.text();
  if (attempt < 3 && (response.status === 429 || response.status >= 500)) {
    await sleep(500 * attempt);
    return fetchText(url, attempt + 1);
  }
  throw new Error(`${response.status} ${response.statusText}`);
}

function storeLinks(html, directoryUrl) {
  const links = [];
  const expression = /href=["']([^"']+)["']/gi;
  for (const match of html.matchAll(expression)) {
    try {
      const url = new URL(match[1], directoryUrl);
      const path = url.pathname.replace(/\/+$/, "/");
      if (!/\/retail\/[^/]+\/$/.test(path)) continue;
      if (/\/(storelist|assets|_next|business|geniusbar)\//.test(path)) continue;
      links.push(url.toString().split("#")[0].split("?")[0]);
    } catch {
      // Ignore non-URL navigation fragments.
    }
  }
  return [...new Set(links)];
}

function findStoreEntity(value) {
  if (!value || typeof value !== "object") return null;
  if (value.geo?.latitude != null && value.geo?.longitude != null && value.address) return value;
  for (const child of Array.isArray(value) ? value : Object.values(value)) {
    const result = findStoreEntity(child);
    if (result) return result;
  }
  return null;
}

function structuredStore(html) {
  const expression = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(expression)) {
    try {
      const entity = findStoreEntity(JSON.parse(match[1].trim()));
      if (entity) return entity;
    } catch {
      // Some pages contain unrelated or malformed structured-data blocks.
    }
  }
  return null;
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const directoryStores = [];
for (const directory of directories) {
  const html = await fetchText(directory.url);
  const links = storeLinks(html, directory.url);
  console.log(`${directory.code}: ${links.length} official store pages`);
  directoryStores.push(...links.map((url) => ({ directory, url })));
}

const failures = [];
const stores = (await mapLimit(directoryStores, 8, async ({ directory, url }, index) => {
  try {
    const html = await fetchText(url);
    const entity = structuredStore(html);
    if (!entity) throw new Error("No store JSON-LD found");
    const latitude = Number(entity.geo.latitude);
    const longitude = Number(entity.geo.longitude);
    const address = entity.address;
    const city = String(address.addressLocality ?? "Unknown").trim();
    const state = String(address.addressRegion ?? city).trim();
    const streetAddress = String(address.streetAddress ?? "").trim().replace(/\s+/g, " ");
    const postalCode = String(address.postalCode ?? "").trim();
    const rawName = String(entity.name ?? url.split("/").filter(Boolean).at(-1));
    const name = rawName.replace(/^Apple\s+(Store,?\s*)?/i, "").trim();
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error("Invalid coordinates");
    if ((index + 1) % 50 === 0) console.log(`Fetched ${index + 1}/${directoryStores.length} store pages`);
    return localizeStoreToEnglish({
      sourceId: new URL(url).pathname.replace(/\/+$/, ""),
      sourceUrl: url,
      name,
      streetAddress,
      city,
      state,
      postalCode,
      country: directory.country,
      countryCode: directory.code,
      continent: directory.continent,
      area: directory.area,
      currency: directory.currency,
      latitude,
      longitude,
      timezone: tzlookup(latitude, longitude),
      phone: String(entity.telephone ?? "").trim(),
      fullAddress: [streetAddress, city, state, postalCode, directory.country].filter(Boolean).join(", "),
    });
  } catch (error) {
    failures.push({ url, message: error instanceof Error ? error.message : String(error) });
    return null;
  }
})).filter(Boolean);

stores.sort((a, b) => a.country.localeCompare(b.country) || a.state.localeCompare(b.state) || a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
const uniqueStores = [...new Map(stores.map((store) => [store.sourceId, store])).values()];
if (uniqueStores.length < 500) throw new Error(`Only ${uniqueStores.length} stores were captured; refusing to replace the snapshot.`);

const output = {
  source: "Apple official retail store directories and store-page JSON-LD",
  sourceDirectory: "https://www.apple.com/retail/storelist/",
  generatedAt: new Date().toISOString(),
  storeCount: uniqueStores.length,
  countryCount: new Set(uniqueStores.map((store) => store.countryCode)).size,
  displayLanguage: "English",
  localizationNote: "Local-script official names and addresses are shown in English or Romanized form; official source URLs and coordinates are unchanged.",
  failures,
  stores: uniqueStores,
};
const outputPath = resolve("data/apple-stores.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${uniqueStores.length} stores across ${output.countryCount} countries to ${outputPath}`);
if (failures.length) console.warn(`${failures.length} store pages failed; see snapshot metadata.`);
