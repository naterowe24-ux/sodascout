-- SodaScout initial schema
-- Run with: supabase db push

-- Locations (gas stations, fast food, soda shops)
create table locations (
  id uuid primary key default gen_random_uuid(),
  google_place_id text unique not null,
  name text not null,
  type text not null check (type in ('gas_station', 'fast_food', 'soda_shop')),
  address text,
  lat double precision not null,
  lng double precision not null,
  google_rating numeric(3,1),
  google_review_count integer default 0,
  has_drive_thru boolean default false,
  has_pebbled_ice boolean,
  has_foam_cup boolean,
  has_lime boolean,
  price_range text check (price_range in ('$', '$$', '$$$')),
  hours jsonb,
  sip_score numeric(3,1),
  sip_score_updated_at timestamptz,
  created_at timestamptz default now()
);

-- Reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null, -- null = guest
  soda_type text not null check (
    soda_type in ('diet_coke', 'coke_zero', 'diet_pepsi', 'sprite', 'dr_pepper', 'other')
  ),
  -- Core (required)
  score_crispiness integer not null check (score_crispiness between 1 and 5),
  score_flavor integer not null check (score_flavor between 1 and 5),
  -- Optional
  score_ice integer check (score_ice between 1 and 5),
  score_cup integer check (score_cup between 1 and 5),
  score_value integer check (score_value between 1 and 5),
  score_drivethu integer check (score_drivethu between 1 and 5),
  score_lime integer check (score_lime between 1 and 5),
  note text,
  created_at timestamptz default now()
);

-- Saved locations (per user)
create table saved_locations (
  user_id uuid references auth.users(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, location_id)
);

-- Indexes for common queries
create index locations_lat_lng on locations (lat, lng);
create index locations_sip_score on locations (sip_score desc nulls last);
create index reviews_location_id on reviews (location_id);
create index saved_locations_user_id on saved_locations (user_id);

-- Row Level Security
alter table locations enable row level security;
alter table reviews enable row level security;
alter table saved_locations enable row level security;

-- Locations: public read, no client write (managed by Edge Function)
create policy "locations_public_read"
  on locations for select
  using (true);

-- Reviews: public read; anyone can insert (guest or logged-in)
create policy "reviews_public_read"
  on reviews for select
  using (true);

create policy "reviews_anyone_insert"
  on reviews for insert
  with check (true);

-- Reviews: owner can delete their own
create policy "reviews_owner_delete"
  on reviews for delete
  using (auth.uid() = user_id);

-- Saved locations: user can only see and manage their own
create policy "saved_locations_owner_select"
  on saved_locations for select
  using (auth.uid() = user_id);

create policy "saved_locations_owner_insert"
  on saved_locations for insert
  with check (auth.uid() = user_id);

create policy "saved_locations_owner_delete"
  on saved_locations for delete
  using (auth.uid() = user_id);
