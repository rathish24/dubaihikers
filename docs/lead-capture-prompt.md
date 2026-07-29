# Dubai Hikers lead-capture implementation prompt

Update the Dubai Hikers event experience from ticket checkout to a lightweight lead-capture flow.

## Product context

Dubai Hikers is validating demand and is not selling tickets or collecting payments yet. Visitors should be able to browse hikes, open an event, and register their interest without creating an account or verifying an email or phone number.

## Required flow

1. Use **Join** as the single primary event CTA.
2. Display the price per hiker on each event card and again in the event details and join form. The price is informational only.
3. When a visitor opens a hike, show the full event details before asking for information.
4. After **Join** is selected, show a short form containing:
   - Full name, required
   - WhatsApp/mobile number, required
   - Email, optional
   - Number of hikers, required
   - Consent to be contacted and acknowledgement that interest does not confirm a place
5. On submission, show a clear interest-received confirmation.
6. Do not include tickets, quantities, cart behavior, checkout, payment collection, OTP, login, registration, or account management.

## Prototype constraint

This phase is front-end only. Do not call an API, write to a database, use cookies, session storage, or local storage, or send the information anywhere. Keep the submitted state only in React component memory and discard it when the modal closes or the page refreshes. Clearly label the form as a prototype so testers know their information is not saved.

## Future backend behavior

When persistence is approved, normalize the WhatsApp number and enforce one lead for each `hike_id + normalized_phone_number`. If the combination already exists, return an “already registered” response rather than creating a duplicate. Handle cancellation manually through WhatsApp during the first production phase.

## UX requirements

- Preserve the existing Dubai Hikers visual language and responsive behavior.
- Use accessible labels, keyboard-safe dialogs, visible focus states, touch targets of at least 44px, inline browser validation, and clear success messaging.
- Do not show **Joined** because submitting interest does not confirm a place.
- Use **Submit interest** for the final form action.
