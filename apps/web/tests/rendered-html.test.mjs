import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Dubai Hikers experience and its primary CTA", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Dubai Hikers \| Guided Mountain Hikes<\/title>/i);
  assert.match(html, /FIND HIGHER(?:<!-- -->)?<br\/>/);
  assert.match(html, /UPCOMING GUIDED EVENTS/);
  assert.match(html, /View upcoming hikes/i);
  assert.match(html, /Ghaf Trail/);
  assert.match(html, /aria-label="Filter by difficulty"/);
  assert.doesNotMatch(html, /Your site is taking shape|Starter Project/);
  assert.doesNotMatch(html, /[—–↗↘✓△]/);
});

test("keeps server and client responsibilities separated", async () => {
  const [page, bookingFeature, eventTypes, dialogHook] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../features/booking/BookingExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../domain/events/types.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/ui/useDialogAccessibility.ts", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /"use client"/);
  assert.match(page, /<BookingExperience events=\{trailEvents\}/);
  assert.match(bookingFeature, /^"use client"/);
  assert.match(bookingFeature, /aria-pressed=/);
  assert.match(eventTypes, /export type TrailEvent/);
  assert.match(eventTypes, /export type BookingItem/);
  assert.match(dialogHook, /event\.key === "Escape"/);
  assert.match(dialogHook, /previouslyFocused\?\.focus\(\)/);
});
