# Product Requirements

## Current Prototype

The current web prototype provides:

- Upcoming hiking-event catalogue
- Difficulty filtering
- Event details, trail statistics, inclusions, and meeting information
- AED pricing and available-capacity display
- Ticket quantity selection
- Customer-details form
- Safety acknowledgement
- Services, guide profile, testimonials, and safety content
- Responsive mobile and desktop layouts

## Launch Requirements

### Event Management

- Admins can create, update, publish, cancel, and archive events.
- Every event references one trail.
- Events store schedule, capacity, price, guide, meeting instructions, and status.
- Capacity cannot fall below confirmed ticket count.

### Customer Booking

- Customers can select an event and ticket quantity.
- Availability is checked again before payment.
- Payment is completed through an approved provider.
- A successful payment creates a confirmed booking.
- Customers receive confirmation and preparation instructions.

### Customer Account

- Guest checkout should be supported initially.
- Customers can later retrieve bookings using verified email or mobile.
- Account creation must not be required before viewing events.

### Safety

- Customers must accept the participation waiver.
- Advanced and expert events can require organiser approval.
- Emergency contact and relevant medical information must be collected securely.
- Weather or trail-condition changes can trigger event notifications.

### Administration

- Role-protected admin access
- Booking and attendee export
- Check-in status
- Refund and cancellation tracking
- Capacity and revenue overview

## Non-Functional Requirements

- Responsive from 320px upward
- Keyboard-accessible controls
- WCAG 2.2 AA colour and focus expectations
- Server-side validation for all writes
- Payment webhook verification
- Audit trail for booking-state changes
- Personally identifiable information stored only when required
- Fast first load on UAE mobile networks

## Out of Scope for the Current Prototype

- Live payments
- Authentication
- Persistent bookings
- Automated messages
- Admin dashboard
- Real-time capacity locking
