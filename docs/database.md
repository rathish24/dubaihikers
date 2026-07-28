# Database Design

Firebase Firestore is the proposed application database. The current prototype still uses static typed data in `apps/web/data/trails.ts`.

## Collections

### `trails`

| Field | Type | Notes |
|---|---|---|
| `name` | string | Public trail name |
| `slug` | string | Stable URL identifier |
| `location` | string | RAK area |
| `difficulty` | string | beginner, moderate, advanced, expert |
| `distanceKm` | number | Organiser-verified route length |
| `elevationM` | number | Organiser-verified elevation gain |
| `estimatedMinutes` | number | Typical guided duration |
| `description` | string | Public trail overview |
| `imageUrl` | string | Hosted image |
| `active` | boolean | Availability for new events |

### `events`

| Field | Type | Notes |
|---|---|---|
| `trailId` | reference | Related trail |
| `guideId` | reference | Assigned guide |
| `startsAt` | timestamp | Local start represented in UTC |
| `meetingPoint` | map | Public label plus private instructions |
| `priceFils` | number | AED stored as integer fils |
| `capacity` | number | Maximum confirmed tickets |
| `confirmedCount` | number | Transactionally maintained |
| `status` | string | draft, published, sold_out, cancelled, completed |
| `requirements` | array | Equipment and eligibility |
| `included` | array | Ticket inclusions |

### `customers`

| Field | Type | Notes |
|---|---|---|
| `displayName` | string | Customer name |
| `email` | string | Normalised email |
| `mobile` | string | E.164 format |
| `createdAt` | timestamp | Record creation |

### `bookings`

| Field | Type | Notes |
|---|---|---|
| `eventId` | reference | Booked event |
| `customerId` | reference | Booking owner |
| `quantity` | number | Ticket count |
| `unitPriceFils` | number | Price snapshot |
| `totalFils` | number | Charged total |
| `status` | string | pending, confirmed, cancelled, refunded |
| `paymentReference` | string | Payment-provider identifier |
| `waiverAcceptedAt` | timestamp | Safety consent timestamp |
| `createdAt` | timestamp | Booking creation |

### `attendees`

One record per hiker when a booking contains multiple tickets. Store emergency and medical fields with restricted access and a documented retention policy.

## Integrity Rules

- Prices use integer fils, never floating-point AED.
- Capacity updates and booking confirmation occur transactionally.
- Payment webhooks are idempotent.
- Public clients never set payment or confirmation status.
- Sensitive attendee data is unavailable to unauthenticated users.
- Cancelled events cannot accept new bookings.

## Indexes

- Events by `status` and `startsAt`
- Events by `trailId` and `startsAt`
- Bookings by `customerId` and `createdAt`
- Bookings by `eventId` and `status`
