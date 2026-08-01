# API Design

The API layer uses Next.js-compatible HTTP route handlers backed by Supabase PostgreSQL. Public clients must not write registration or payment state directly to Supabase.

## Public Endpoints

### `GET /api/events`

Returns published upcoming events.

Query parameters:

- `difficulty`
- `from`
- `limit`
- `cursor`

### `GET /api/events/:eventId`

Returns public event details and current availability.

### `POST /api/registrations`

Validates the customer details, rechecks event availability, and creates a confirmed registration when sufficient places remain.

`contactEmail` is required and is used to send the booking-reference email.

Request:

```json
{
  "eventId": "event-id",
  "contactName": "Example Hiker",
  "contactEmail": "hiker@example.com",
  "contactPhone": "+971500000000",
  "numberOfHikers": 2,
  "customerNotes": "We will travel together.",
  "waiverAccepted": true,
  "idempotencyKey": "963476ca-f3fa-4dd6-82de-55a6875cc405"
}
```

Response:

```json
{
  "registration": {
    "referenceNumber": "DH-2F3B54E823",
    "status": "confirmed",
    "numberOfHikers": 2,
    "unitPrice": 125,
    "totalAmount": 250,
    "currency": "AED"
  }
}
```

### `POST /api/payments/webhook`

Receives signed payment-provider events. The handler must:

1. Verify the provider signature.
2. Reject replayed or unknown events.
3. Confirm the price and event.
4. Create or update the booking idempotently.
5. Update capacity transactionally.
6. Trigger confirmation messaging.

## Authenticated Customer Endpoints

- `GET /api/me/bookings`
- `GET /api/me/bookings/:bookingId`
- `POST /api/me/bookings/:bookingId/cancel`

## Admin Endpoints

- `POST /api/admin/events`
- `PATCH /api/admin/events/:eventId`
- `POST /api/admin/events/:eventId/cancel`
- `GET /api/admin/events/:eventId/attendees`
- `POST /api/admin/bookings/:bookingId/check-in`

Admin endpoints require verified role claims and server-side authorisation.

## Error Shape

```json
{
  "error": {
    "code": "EVENT_SOLD_OUT",
    "message": "This hike no longer has enough available places.",
    "requestId": "request-id"
  }
}
```
