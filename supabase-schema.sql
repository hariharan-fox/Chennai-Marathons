-- Chennai Marathons directory — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  event_date date not null,
  area text not null,
  distances text[] not null,
  description text default '',
  organizer_name text not null,
  organizer_phone text not null,
  organizer_email text not null,
  website text default '',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_at timestamptz not null default now()
);

create table if not exists ad_banners (
  slot int primary key check (slot in (1,2,3)),
  title text default '',
  body text default '',
  image_url text default '',
  link_url text default '',
  cta_text text default 'Advertise Here'
);

-- Seed the 3 ad slots so the banners endpoint always has rows to read/update
insert into ad_banners (slot, title, body, cta_text) values
  (1, 'Your Race, Featured Here', 'Reach thousands of Chennai runners searching for their next event.', 'Advertise Here'),
  (2, 'Gear Up For Race Day', 'Running shoes, hydration belts and more from local sports stores.', 'Advertise Here'),
  (3, 'Advertise on this Directory', 'Contact us to place a banner in this slot.', 'Advertise Here')
on conflict (slot) do nothing;

-- Optional: a few sample listings so the site isn't empty on first load.
-- Safe to skip or delete later from the admin panel.
insert into listings (event_name, event_date, area, distances, description, organizer_name, organizer_phone, organizer_email, website, status)
values
  ('Marina Sunrise 10K', '2026-11-08', 'Marina Beach', array['10K','5K'], 'An early-morning run along the Marina promenade, flat and fast route with hydration points every 2km.', 'Chennai Coastal Runners Club', '+91 98765 43210', 'hello@coastalrunners.example', 'https://coastalrunners.example', 'approved'),
  ('OMR Tech Corridor Half Marathon', '2026-12-14', 'OMR', array['Half Marathon','10K'], 'Route winds through the OMR IT corridor, popular with the tech-park running community.', 'Velocity Sports Chennai', '+91 90000 11122', 'race@velocitysports.example', 'https://velocitysports.example', 'approved');

-- Row Level Security: enable it, but since all writes/updates go through
-- our serverless functions (using the service role key, which bypasses RLS),
-- we don't need public policies here. This just ensures no one can query
-- the tables directly with the anon/public key.
alter table listings enable row level security;
alter table ad_banners enable row level security;
