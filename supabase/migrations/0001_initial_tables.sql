-- Lineup: the first version of the database.
-- Four tables: profiles, friendships, events, plans.
-- Lines starting with "--" are notes for humans; the database ignores them.


-- 1. PROFILES: the public part of each person.
-- Supabase keeps the private login (email, password) in its own "auth.users" table;
-- each profile row points at one of those logins.
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null,
  created_at   timestamptz not null default now()
);


-- 2. FRIENDSHIPS: mutual, like Beli. One person asks, the other accepts.
create table friendships (
  requester_id uuid not null references profiles (id) on delete cascade,
  addressee_id uuid not null references profiles (id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at   timestamptz not null default now(),
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);


-- 3. EVENTS: one row per show, saved the first time anyone marks it.
-- "source" says where it came from: Ticketmaster search, or added by hand
-- (for DICE / RA shows Ticketmaster doesn't list).
create table events (
  id          uuid primary key default gen_random_uuid(),
  source      text not null check (source in ('ticketmaster', 'manual')),
  source_id   text,                -- Ticketmaster's id for the show; empty for manual ones
  artist      text not null,
  venue       text not null,
  city        text,
  starts_at   timestamptz not null,
  ticket_url  text,
  image_url   text,
  created_by  uuid references profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (source, source_id)       -- the same Ticketmaster show is only saved once
);


-- 4. PLANS: the heart of the app. One row per person per show.
-- status: 'interested' or 'going'. has_tickets is only meaningful when going,
-- which gives the three states: Interested / Going, needs tickets / Going, has tickets.
create table plans (
  user_id     uuid not null references profiles (id) on delete cascade,
  event_id    uuid not null references events (id) on delete cascade,
  status      text not null check (status in ('interested', 'going')),
  has_tickets boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, event_id),
  check (has_tickets = false or status = 'going')
);

-- Makes "my friends' plans, newest first" (the feed) fast.
create index plans_updated_idx on plans (updated_at desc);


-- HELPER: are two people friends? Used by the privacy rules below.
create or replace function are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from friendships f
    where f.status = 'accepted'
      and ((f.requester_id = a and f.addressee_id = b)
        or (f.requester_id = b and f.addressee_id = a))
  );
$$;


-- PRIVACY RULES ("row level security").
-- With these on, the database itself refuses to hand out rows a person
-- shouldn't see, even if there's a bug in the app.
alter table profiles    enable row level security;
alter table friendships enable row level security;
alter table events      enable row level security;
alter table plans       enable row level security;

-- Profiles: any signed-in person can look people up (to add friends);
-- you can only create or edit your own.
create policy "profiles are visible to signed-in users" on profiles
  for select to authenticated using (true);
create policy "you create your own profile" on profiles
  for insert to authenticated with check (id = auth.uid());
create policy "you edit your own profile" on profiles
  for update to authenticated using (id = auth.uid());

-- Friendships: you see the ones you're part of; you can send a request;
-- only the person asked can accept; either side can remove it.
create policy "see your own friendships" on friendships
  for select to authenticated
  using (auth.uid() in (requester_id, addressee_id));
create policy "send a friend request" on friendships
  for insert to authenticated
  with check (requester_id = auth.uid() and status = 'pending');
create policy "accept a request sent to you" on friendships
  for update to authenticated
  using (addressee_id = auth.uid())
  with check (status = 'accepted');
create policy "remove a friendship" on friendships
  for delete to authenticated
  using (auth.uid() in (requester_id, addressee_id));

-- Events: shows are public info; any signed-in person can add one.
create policy "events are visible to signed-in users" on events
  for select to authenticated using (true);
create policy "signed-in users can add events" on events
  for insert to authenticated with check (created_by = auth.uid());

-- Plans: you see your own and your friends'. You only change your own.
create policy "see your plans and your friends' plans" on plans
  for select to authenticated
  using (user_id = auth.uid() or are_friends(auth.uid(), user_id));
create policy "add your own plans" on plans
  for insert to authenticated with check (user_id = auth.uid());
create policy "change your own plans" on plans
  for update to authenticated using (user_id = auth.uid());
create policy "remove your own plans" on plans
  for delete to authenticated using (user_id = auth.uid());
