alter table public.event_registrations
  add constraint event_registrations_contact_email_required
  check (contact_email is not null) not valid;

comment on constraint event_registrations_contact_email_required
  on public.event_registrations is
  'Requires an email for new registrations while preserving historical rows created before email became mandatory.';
