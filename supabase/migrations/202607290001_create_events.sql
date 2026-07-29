create type public.event_difficulty as enum (
  'beginner',
  'moderate',
  'advanced',
  'expert'
);

create type public.event_status as enum (
  'draft',
  'published',
  'cancelled',
  'completed'
);

create type public.event_availability as enum (
  'open',
  'few_spots',
  'full',
  'waitlist',
  'closed'
);

create type public.minor_participation_policy as enum (
  'not_allowed',
  'guardian_required',
  'guardian_consent_required'
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,

  location_name text not null,
  meeting_point_label text,

  starts_at timestamptz not null,
  registration_closes_at timestamptz,
  duration_minutes integer not null,

  difficulty public.event_difficulty not null,
  distance_km numeric(5,2) not null,
  elevation_gain_m integer not null default 0,

  minimum_age smallint not null default 18,
  maximum_age smallint,
  minor_policy public.minor_participation_policy not null default 'not_allowed',

  price numeric(10,2) not null default 0,
  currency char(3) not null default 'AED',

  capacity integer not null,
  available_slots integer not null,
  availability public.event_availability not null default 'open',
  waitlist_enabled boolean not null default false,

  image_url text not null,
  highlights text[] not null default '{}',
  included_items text[] not null default '{}',
  tags text[] not null default '{}',

  sharing_enabled boolean not null default true,
  share_title text,
  share_description text,
  share_image_url text,

  status public.event_status not null default 'draft',
  is_featured boolean not null default false,
  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint events_name_not_empty check (char_length(trim(name)) > 0),
  constraint events_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint events_duration_positive check (duration_minutes > 0),
  constraint events_distance_positive check (distance_km > 0),
  constraint events_elevation_valid check (elevation_gain_m >= 0),
  constraint events_minimum_age_valid check (minimum_age between 0 and 100),
  constraint events_maximum_age_valid check (
    maximum_age is null or maximum_age between minimum_age and 100
  ),
  constraint events_price_valid check (price >= 0),
  constraint events_capacity_positive check (capacity > 0),
  constraint events_available_slots_valid check (
    available_slots between 0 and capacity
  ),
  constraint events_registration_date_valid check (
    registration_closes_at is null or registration_closes_at <= starts_at
  ),
  constraint events_published_at_required check (
    status <> 'published' or published_at is not null
  )
);

create index events_public_listing_idx
  on public.events (status, starts_at);

create index events_difficulty_idx
  on public.events (difficulty);

create index events_availability_idx
  on public.events (availability);

create index events_featured_idx
  on public.events (is_featured, starts_at)
  where status = 'published';

create index events_tags_idx
  on public.events using gin (tags);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

alter table public.events enable row level security;

grant select on public.events to anon, authenticated;
revoke insert, update, delete on public.events from anon, authenticated;

create policy "Published events are publicly visible"
on public.events
for select
to anon, authenticated
using (status = 'published');
