import { readFile } from "node:fs/promises";

const supabaseUrl = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY.");
  console.error("Copy .env.example to .env and set the required values before running this script.");
  process.exit(1);
}

const seedUrl = new URL("../seed/events.json", import.meta.url);
const events = JSON.parse(await readFile(seedUrl, "utf8"));
const endpoint = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/events?on_conflict=slug`;

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    apikey: secretKey,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=representation",
  },
  body: JSON.stringify(events),
});

if (!response.ok) {
  const detail = await response.text();
  console.error(`Event seed failed with status ${response.status}.`);
  console.error(detail);
  process.exit(1);
}

const seeded = await response.json();
console.log(`Seeded ${seeded.length} events.`);
