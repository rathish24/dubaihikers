# API Design

The API layer is planned for Firebase HTTPS callable functions or standard HTTPS functions. Public clients must not write booking or payment state directly to Firestore.

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

### `POST /api/checkout/session`

Validates event availability and creates a short-lived payment session.

Request:

```json
{
  "eventId": "event-id",
  "quantity": 2,
  "customer": {
    "name": "Example Hiker",
    "email": "hiker@example.com",
    "mobile": "+971500000000"
  },
  "waiverAccepted": true
}
```

Response:

```json
{
  "checkoutUrl": "https://payment-provider.example/session",
  "expiresAt": "2026-08-01T08:10:00Z"
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
