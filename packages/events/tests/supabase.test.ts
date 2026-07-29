import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EventRepositoryError,
  SupabaseEventRepository,
  type SupabaseEventRow,
} from "../src/index";

const row: SupabaseEventRow = {
  id: "8bb9d314-fefd-42eb-87f0-f14a38a96118",
  slug: "sunrise-hike",
  name: "Sunrise Hike",
  description: "A friendly sunrise hike.",
  location_name: "Hatta",
  meeting_point_label: null,
  starts_at: "2027-01-02T02:00:00.000Z",
  registration_closes_at: null,
  duration_minutes: 180,
  difficulty: "beginner",
  distance_km: "6.50",
  elevation_gain_m: 220,
  minimum_age: 12,
  maximum_age: null,
  minor_policy: "guardian_required",
  price: "125.00",
  currency: "AED",
  capacity: 20,
  available_slots: 8,
  availability: "open",
  waitlist_enabled: false,
  image_url: "https://example.com/hike.jpg",
  highlights: ["Sunrise"],
  included_items: ["Guide"],
  tags: ["first-timer-friendly"],
  sharing_enabled: true,
  share_title: null,
  share_description: null,
  share_image_url: null,
  status: "published",
  is_featured: true,
  published_at: "2026-07-29T00:00:00.000Z",
  created_at: "2026-07-29T00:00:00.000Z",
  updated_at: "2026-07-29T00:00:00.000Z",
};

type QueryCall = [method: string, ...arguments_: unknown[]];

function mockClient(result: { data: SupabaseEventRow[] | null; error: unknown }) {
  const calls: QueryCall[] = [];
  const query = {
    select(...arguments_: unknown[]) {
      calls.push(["select", ...arguments_]);
      return query;
    },
    eq(...arguments_: unknown[]) {
      calls.push(["eq", ...arguments_]);
      return query;
    },
    order(...arguments_: unknown[]) {
      calls.push(["order", ...arguments_]);
      return query;
    },
    gte(...arguments_: unknown[]) {
      calls.push(["gte", ...arguments_]);
      return query;
    },
    then(resolve: (value: typeof result) => unknown, reject: (reason: unknown) => unknown) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };

  const client = {
    from(table: string) {
      calls.push(["from", table]);
      return query;
    },
  } as unknown as SupabaseClient;

  return { client, calls };
}

test("queries published future events and maps database fields", async () => {
  const { client, calls } = mockClient({ data: [row], error: null });
  const events = await new SupabaseEventRepository(client).listPublished();

  assert.equal(events.length, 1);
  assert.equal(events[0]?.locationName, "Hatta");
  assert.equal(events[0]?.distanceKm, 6.5);
  assert.equal(events[0]?.price, 125);
  assert.deepEqual(calls.slice(0, 4), [
    ["from", "events"],
    ["select", "*"],
    ["eq", "status", "published"],
    ["order", "starts_at", { ascending: true }],
  ]);
  assert.equal(calls.some(([method, column]) => method === "gte" && column === "starts_at"), true);
});

test("applies optional filters without a past-event filter", async () => {
  const { client, calls } = mockClient({ data: [], error: null });
  await new SupabaseEventRepository(client).listPublished({
    difficulty: "advanced",
    featuredOnly: true,
    includePast: true,
  });

  assert.equal(calls.some(([method]) => method === "gte"), false);
  assert.equal(
    calls.some((call) => JSON.stringify(call) === JSON.stringify(["eq", "difficulty", "advanced"])),
    true,
  );
  assert.equal(
    calls.some((call) => JSON.stringify(call) === JSON.stringify(["eq", "is_featured", true])),
    true,
  );
});

test("turns Supabase failures into a repository error", async () => {
  const databaseError = { message: "relation does not exist" };
  const { client } = mockClient({ data: null, error: databaseError });

  await assert.rejects(
    () => new SupabaseEventRepository(client).listPublished(),
    (error: unknown) => {
      assert.equal(error instanceof EventRepositoryError, true);
      assert.equal((error as Error).message, "Unable to load the event catalogue.");
      assert.equal((error as Error & { cause?: unknown }).cause, databaseError);
      return true;
    },
  );
});
