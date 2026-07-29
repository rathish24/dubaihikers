# Dubai Hikers

Dubai Hikers is a responsive guided hiking-events website for mountain adventures across the UAE. Visitors can discover events, filter by difficulty, inspect trail details, and submit a prototype expression-of-interest form.

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
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

The website uses the project URL and publishable key to read published events under RLS. The secret key is reserved for local migration and seed administration and must never be exposed to browser code.

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

The event catalogue is loaded dynamically from Supabase. The Join form remains front-end only and does not transmit or persist customer information.

Before accepting real leads, connect the form to a validated backend and enforce duplicate detection with the hike ID and normalized phone number.
