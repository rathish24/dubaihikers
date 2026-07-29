create type public.registration_status as enum (
  'pending',
  'confirmed',
  'waitlisted',
  'cancelled',
  'refunded'
);

create type public.registration_payment_status as enum (
  'not_required',
  'pending',
  'paid',
  'failed',
  'refunded'
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique default (
    'DH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  ),
  event_id uuid not null references public.events (id) on delete restrict,
  user_id uuid references auth.users (id) on delete set null,

  contact_name text not null,
  contact_email text,
  contact_phone text not null,
  number_of_hikers smallint not null,
  customer_notes text,

  unit_price numeric(10,2) not null,
  total_amount numeric(10,2) generated always as
    (unit_price * number_of_hikers) stored,
  currency char(3) not null,

  status public.registration_status not null default 'pending',
  payment_status public.registration_payment_status not null default 'pending',
  payment_provider text,
  payment_reference text,
  idempotency_key uuid not null unique,

  waiver_accepted_at timestamptz not null,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint event_registrations_contact_name_valid
    check (char_length(trim(contact_name)) between 2 and 120),
  constraint event_registrations_contact_email_valid
    check (
      contact_email is null
      or char_length(trim(contact_email)) between 3 and 254
    ),
  constraint event_registrations_contact_phone_valid
    check (contact_phone ~ '^\+[1-9][0-9]{7,14}$'),
  constraint event_registrations_hiker_count_valid
    check (number_of_hikers between 1 and 20),
  constraint event_registrations_customer_notes_valid
    check (customer_notes is null or char_length(customer_notes) <= 1000),
  constraint event_registrations_unit_price_valid
    check (unit_price >= 0),
  constraint event_registrations_currency_format
    check (currency ~ '^[A-Z]{3}$'),
  constraint event_registrations_confirmation_date_valid
    check (status <> 'confirmed' or confirmed_at is not null),
  constraint event_registrations_cancellation_date_valid
    check (status not in ('cancelled', 'refunded') or cancelled_at is not null)
);

create index event_registrations_event_status_idx
  on public.event_registrations (event_id, status);

create index event_registrations_user_idx
  on public.event_registrations (user_id, created_at desc)
  where user_id is not null;

create index event_registrations_contact_email_idx
  on public.event_registrations (lower(contact_email))
  where contact_email is not null;

create index event_registrations_contact_phone_idx
  on public.event_registrations (contact_phone);

create unique index event_registrations_payment_reference_idx
  on public.event_registrations (payment_provider, payment_reference)
  where payment_reference is not null;

create trigger event_registrations_set_updated_at
before update on public.event_registrations
for each row
execute function public.set_updated_at();

create or replace function public.sync_event_registration_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  reserved_before integer := 0;
  reserved_after integer := 0;
  slot_delta integer;
  event_row public.events%rowtype;
begin
  if tg_op = 'UPDATE' and old.event_id <> new.event_id then
    raise exception using
      errcode = 'P0001',
      message = 'A registration cannot be moved to another event.';
  end if;

  if tg_op in ('UPDATE', 'DELETE') and old.status = 'confirmed' then
    reserved_before := old.number_of_hikers;
  end if;

  if tg_op in ('INSERT', 'UPDATE') and new.status = 'confirmed' then
    reserved_after := new.number_of_hikers;
  end if;

  slot_delta := reserved_after - reserved_before;
  if slot_delta = 0 then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  select *
  into event_row
  from public.events
  where id = case when tg_op = 'DELETE' then old.event_id else new.event_id end
  for update;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'The selected event does not exist.';
  end if;

  if slot_delta > 0 then
    if event_row.status <> 'published'
      or event_row.availability not in ('open', 'few_spots') then
      raise exception using
        errcode = 'P0001',
        message = 'This event is not open for booking.';
    end if;

    if event_row.registration_closes_at is not null
      and event_row.registration_closes_at <= now() then
      raise exception using
        errcode = 'P0001',
        message = 'Registration for this event has closed.';
    end if;

    if event_row.available_slots < slot_delta then
      raise exception using
        errcode = 'P0001',
        message = 'This event does not have enough available places.';
    end if;
  end if;

  update public.events
  set
    available_slots = available_slots - slot_delta,
    availability = case
      when status <> 'published' or availability in ('closed', 'waitlist')
        then availability
      when available_slots - slot_delta = 0
        then 'full'::public.event_availability
      when available_slots - slot_delta <= greatest(1, ceil(capacity * 0.2))
        then 'few_spots'::public.event_availability
      else 'open'::public.event_availability
    end
  where id = event_row.id;

  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

create trigger event_registrations_sync_capacity
before insert or update or delete on public.event_registrations
for each row
execute function public.sync_event_registration_capacity();

create or replace function public.create_event_registration(
  p_event_id uuid,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_number_of_hikers smallint,
  p_customer_notes text,
  p_waiver_accepted boolean,
  p_idempotency_key uuid
)
returns table (
  id uuid,
  reference_number text,
  event_id uuid,
  number_of_hikers smallint,
  status public.registration_status,
  unit_price numeric,
  total_amount numeric,
  currency char(3),
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_row public.events%rowtype;
  registration_row public.event_registrations%rowtype;
  next_status public.registration_status;
begin
  select *
  into registration_row
  from public.event_registrations
  where idempotency_key = p_idempotency_key;

  if found then
    return query
    select
      registration_row.id,
      registration_row.reference_number,
      registration_row.event_id,
      registration_row.number_of_hikers,
      registration_row.status,
      registration_row.unit_price,
      registration_row.total_amount,
      registration_row.currency,
      registration_row.created_at;
    return;
  end if;

  if not p_waiver_accepted then
    raise exception using
      errcode = '22023',
      message = 'The participation waiver must be accepted.';
  end if;

  select *
  into event_row
  from public.events as event_record
  where event_record.id = p_event_id
  for update;

  if not found or event_row.status <> 'published' then
    raise exception using
      errcode = 'P0001',
      message = 'This event is not open for booking.';
  end if;

  if event_row.registration_closes_at is not null
    and event_row.registration_closes_at <= now() then
    raise exception using
      errcode = 'P0001',
      message = 'Registration for this event has closed.';
  end if;

  if event_row.availability in ('open', 'few_spots') then
    if event_row.available_slots < p_number_of_hikers then
      raise exception using
        errcode = 'P0001',
        message = 'This event does not have enough available places.';
    end if;
    next_status := 'confirmed';
  elsif event_row.availability = 'waitlist'
    or (event_row.availability = 'full' and event_row.waitlist_enabled) then
    next_status := 'waitlisted';
  else
    raise exception using
      errcode = 'P0001',
      message = 'This event is not open for booking.';
  end if;

  insert into public.event_registrations (
    event_id,
    user_id,
    contact_name,
    contact_email,
    contact_phone,
    number_of_hikers,
    customer_notes,
    unit_price,
    currency,
    status,
    payment_status,
    idempotency_key,
    waiver_accepted_at,
    confirmed_at
  )
  values (
    event_row.id,
    auth.uid(),
    trim(p_contact_name),
    nullif(lower(trim(p_contact_email)), ''),
    p_contact_phone,
    p_number_of_hikers,
    nullif(trim(p_customer_notes), ''),
    event_row.price,
    event_row.currency,
    next_status,
    'not_required',
    p_idempotency_key,
    now(),
    case when next_status = 'confirmed' then now() else null end
  )
  returning * into registration_row;

  return query
  select
    registration_row.id,
    registration_row.reference_number,
    registration_row.event_id,
    registration_row.number_of_hikers,
    registration_row.status,
    registration_row.unit_price,
    registration_row.total_amount,
    registration_row.currency,
    registration_row.created_at;
end;
$$;

alter table public.event_registrations enable row level security;

revoke all on public.event_registrations from anon, authenticated;
grant select on public.event_registrations to authenticated;

create policy "Customers can view their own registrations"
on public.event_registrations
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on function public.create_event_registration(
  uuid, text, text, text, smallint, text, boolean, uuid
) from public, anon, authenticated;
grant execute on function public.create_event_registration(
  uuid, text, text, text, smallint, text, boolean, uuid
) to service_role;
