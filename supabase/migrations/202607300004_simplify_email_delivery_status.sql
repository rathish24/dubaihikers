alter table public.registration_email_deliveries
  drop constraint registration_email_deliveries_sent_state_valid;

alter table public.registration_email_deliveries
  alter column status drop default;

alter type public.email_delivery_status rename to email_delivery_status_previous;

create type public.email_delivery_status as enum (
  'delivered',
  'undelivered'
);

alter table public.registration_email_deliveries
  alter column status type public.email_delivery_status
  using (
    case
      when status::text = 'sent' then 'delivered'
      else 'undelivered'
    end
  )::public.email_delivery_status;

alter table public.registration_email_deliveries
  alter column status set default 'undelivered';

drop type public.email_delivery_status_previous;

alter table public.registration_email_deliveries
  rename column sent_at to delivered_at;

alter table public.registration_email_deliveries
  drop column attempt_count,
  drop column queued_at,
  drop column last_attempted_at;

alter table public.registration_email_deliveries
  add constraint registration_email_deliveries_delivered_state_valid
    check (status <> 'delivered' or delivered_at is not null);
