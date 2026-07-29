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
├── data/                   Current static event data source
├── db/                     Database adapter and schema boundary
├── worker/                 Cloudflare runtime entry point
└── tests/                  Rendering and architecture regression tests
```

`app/page.tsx` remains a server component. Only the event filtering and interest workflow crosses the client boundary through `BookingExperience`. UI components receive typed data and callbacks rather than reading global state.

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

## Validation

```bash
pnpm lint
pnpm test
pnpm build
```

`pnpm test` performs a production build and verifies server-rendered product content and important architecture boundaries.

## Current product scope

The event catalogue is currently supplied by a typed static module. The join form is deliberately front-end only and does not transmit or persist customer information.

Before accepting real leads, connect the form to a validated backend and enforce duplicate detection with the hike ID and normalized phone number.
