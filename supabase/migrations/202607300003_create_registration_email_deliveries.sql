create type public.email_delivery_status as enum (
  'queued',
  'sending',
  'sent',
  'failed'
);

create table public.registration_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null
    references public.event_registrations (id) on delete cascade,
  message_type text not null,
  recipient text not null,
  provider text not null,
  provider_message_id text,
  status public.email_delivery_status not null default 'queued',
  attempt_count smallint not null default 0,
  last_error text,
  queued_at timestamptz not null default now(),
  last_attempted_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint registration_email_deliveries_message_type_valid
    check (message_type ~ '^[a-z0-9_]+$'),
  constraint registration_email_deliveries_recipient_valid
    check (char_length(trim(recipient)) between 3 and 254),
  constraint registration_email_deliveries_provider_valid
    check (char_length(trim(provider)) > 0),
  constraint registration_email_deliveries_attempt_count_valid
    check (attempt_count >= 0),
  constraint registration_email_deliveries_sent_state_valid
    check (status <> 'sent' or sent_at is not null),
  constraint registration_email_deliveries_error_length_valid
    check (last_error is null or char_length(last_error) <= 500)
);

create unique index registration_email_deliveries_message_idx
  on public.registration_email_deliveries (registration_id, message_type);

create unique index registration_email_deliveries_provider_message_idx
  on public.registration_email_deliveries (provider, provider_message_id)
  where provider_message_id is not null;

create index registration_email_deliveries_status_idx
  on public.registration_email_deliveries (status, queued_at);

create trigger registration_email_deliveries_set_updated_at
before update on public.registration_email_deliveries
for each row
execute function public.set_updated_at();

alter table public.registration_email_deliveries enable row level security;

revoke all on public.registration_email_deliveries from anon, authenticated;
