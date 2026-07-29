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
  assert.match(html, /aria-label="Filter by difficulty"/);
  assert.match(html, /<h2 id="faqs-title">FAQs<\/h2>/);
  assert.match(html, /Is this suitable for my first mountain hike\?/);
  assert.match(html, /Does tapping Book now confirm my place\?/);
  assert.doesNotMatch(html, /Your site is taking shape|Starter Project/);
  assert.doesNotMatch(html, /[—–↗↘✓△]/);
});

test("keeps server and client responsibilities separated", async () => {
  const [page, bookingFeature, eventTypes, eventModal, dialogHook] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../features/booking/BookingExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../domain/events/types.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/EventModal.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ui/useDialogAccessibility.ts", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /"use client"/);
  assert.match(page, /await getEvents\(\)/);
  assert.match(page, /<BookingExperience events=\{events\} loadError=\{error\}/);
  assert.doesNotMatch(page, /trailEvents|data\/trails/);
  assert.match(bookingFeature, /^"use client"/);
  assert.match(bookingFeature, /aria-pressed=/);
  assert.match(eventTypes, /export type TrailEvent/);
  assert.doesNotMatch(eventTypes, /BookingItem/);
  assert.match(eventModal, /Book now/);
  assert.match(eventModal, /customerNotes/);
  assert.match(eventModal, /RegistrationClient/);
  assert.doesNotMatch(eventModal, /fetch\(|localStorage|sessionStorage/);
  assert.match(dialogHook, /event\.key === "Escape"/);
  assert.match(dialogHook, /previouslyFocused\?\.focus\(\)/);
});

test("keeps registration email delivery and content outside the route handler", async () => {
  const [route, emailConfig, emailService, deliveryTask, htmlTemplate, textTemplate] = await Promise.all([
    readFile(new URL("../app/api/registrations/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../config/notifications.ts", import.meta.url), "utf8"),
    readFile(new URL("../../../packages/notifications/src/registrationEmail.ts", import.meta.url), "utf8"),
    readFile(new URL("../../../packages/notifications/src/sendRegistrationEmail.ts", import.meta.url), "utf8"),
    readFile(new URL("../../../packages/notifications/src/templates/registration-received.html", import.meta.url), "utf8"),
    readFile(new URL("../../../packages/notifications/src/templates/registration-received.txt", import.meta.url), "utf8"),
  ]);

  assert.match(route, /await repository\.create\(input\)/);
  assert.match(route, /after\(\(\) =>\s+sendRegistrationEmail/);
  assert.doesNotMatch(route, /api\.resend\.com|Your next trail starts here/);
  assert.match(emailConfig, /REGISTRATION_NOTIFICATION_EMAIL/);
  assert.doesNotMatch(emailService, /process\.env|REGISTRATION_NOTIFICATION_EMAIL/);
  assert.match(emailService, /Idempotency-Key/);
  assert.match(deliveryTask, /recordDelivered/);
  assert.match(deliveryTask, /recordUndelivered/);
  assert.match(htmlTemplate, /\{\{reference_number\}\}/);
  assert.match(textTemplate, /The mountains are calling/);
});
