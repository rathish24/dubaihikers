# Dubai Hikers

Dubai Hikers is a responsive guided hiking-events website for mountain adventures across the UAE. Visitors can discover events, filter by difficulty, inspect trail details, and reserve places through the event registration flow.

## Technology

- React 19 and Next.js 16 conventions
- TypeScript with strict type checking
- Vinext and Vite
- Cloudflare Workers-compatible output
- pnpm workspaces
- Drizzle/D1 integration point for future persistence

## Architecture

The application separates stable domain concepts, interactive features, reusable UI, static content, and runtime infrastructure:

```text
apps/web/
├── app/                    Server-rendered routes and global composition
├── components/
│   └── ui/                 Reusable, domain-neutral UI primitives and hooks
├── domain/
│   └── events/             Event types and formatting rules
├── features/
│   └── booking/            Client-side booking workflow and state
├── data/                   Server-side event application service
├── db/                     Database adapter and schema boundary
├── worker/                 Cloudflare runtime entry point
└── tests/                  Rendering and architecture regression tests

packages/events/
├── src/types.ts            Event domain model
├── src/repository.ts       Replaceable repository contract
└── src/supabase.ts         Supabase repository implementation

supabase/
├── migrations/             Reviewed PostgreSQL migrations
├── seed/                   Versioned sample event data
└── scripts/                Local administrative tooling
```

`app/page.tsx` remains a server component. It loads events through the standalone `@dubaihikers/events` repository and passes serializable UI data into `BookingExperience`. UI components do not import Supabase code or environment variables.

See [docs/architecture.md](docs/architecture.md) for design decisions, dependency rules, scalability guidance, and the production backend roadmap.

The visual layer is governed by the project-local skills in `.agents/skills`: frontend direction, design-taste preflight, and the responsive design system. The implemented contracts include fluid tokens, standard breakpoints, container-aware event cards, 44px controls, responsive images, reduced motion, and system dark mode.

## Requirements

- Node.js 22.13 or newer
- pnpm 10.32.1

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Supabase event catalogue

Copy `.env.example` to `apps/web/.env.local` and provide:

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
REGISTRATION_NOTIFICATION_EMAIL
RESEND_API_KEY
RESEND_EMAIL_FROM
```

The server uses the project URL and publishable key to read published events under RLS. The registration API uses the same server URL with `SUPABASE_SECRET_KEY` for protected writes. None of these variables are exposed to browser code.

Successful registrations send a booking-reference notification through Resend when all three email variables are configured. During initial testing, `REGISTRATION_NOTIFICATION_EMAIL` is the fixed recipient and `RESEND_EMAIL_FROM` may use Resend's onboarding sender. After domain verification, replace the sender with an address on the verified domain and change delivery to the customer's supplied email.

Apply `supabase/migrations/202607290001_create_events.sql` in the Supabase SQL Editor, then seed the ten sample hikes:

```bash
pnpm db:seed:events
```

The seed is idempotent by event slug and updates matching rows instead of creating duplicates.

## Validation

```bash
pnpm lint
pnpm test
pnpm build
```

`pnpm test` runs mocked Supabase repository unit tests, performs a production
build, and verifies server-rendered product content and important architecture
boundaries. The tests do not read from or write to the live database.

## Current product scope

The event catalogue and registrations are persisted in Supabase. Registration writes pass through a validated server endpoint; browser code cannot set prices, payment state, or booking status directly.

Before accepting real leads, connect the form to a validated backend and enforce duplicate detection with the hike ID and normalized phone number.
