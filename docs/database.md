# Database Design

Supabase PostgreSQL is the event catalogue database. Event persistence is isolated from the web UI through the standalone `@dubaihikers/events` package.

## Ownership

- `packages/events/src/types.ts` owns the persisted event domain.
- `packages/events/src/repository.ts` defines the replaceable data-source contract.
- `packages/events/src/supabase.ts` maps Supabase rows into domain events.
- `apps/web/data/events.ts` formats domain events for the existing UI.
- `supabase/migrations` owns database structure and access policies.
- `supabase/seed` owns the versioned sample catalogue.

The component and feature layers do not import Supabase code, keys, table names, or snake-case database fields.

## Event access

The public website reads only rows whose status is `published`. Row-level security prevents anonymous clients from writing events. Administrative writes use protected server or local tooling with a Supabase secret key.

The web query:

- filters to published events;
- excludes past events by default;
- sorts by `starts_at`;
- disables framework caching so catalogue changes are visible on the next request.

## Capacity

`capacity` is the maximum group size. `available_slots` and `availability` are manually maintained during the lead-generation phase. Submitting interest does not reduce availability. When confirmed registrations are introduced, remaining slots should be calculated transactionally rather than maintained manually.

## Seed data

`supabase/seed/events.json` contains ten events across Beginner, Moderate, Advanced, and Expert levels. `pnpm db:seed:events` upserts these rows using the unique event slug.

## Security

- RLS is enabled on `public.events`.
- Anonymous and authenticated visitors may select published events.
- No public insert, update, or delete policy exists.
- The Supabase secret key is never exposed to the browser.
- Public meeting-point labels do not contain sensitive final instructions.
