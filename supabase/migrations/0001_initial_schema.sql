create table artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  mbid text unique,
  created_at timestamptz not null default now()
);

create table tours (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (artist_id, slug)
);

create table shows (
  id uuid primary key default gen_random_uuid(),
  setlistfm_id text unique not null,
  artist_id uuid not null references artists(id) on delete cascade,
  tour_id uuid references tours(id) on delete set null,
  event_date date not null,
  venue_name text,
  city text,
  state text,
  country text,
  setlist_url text,
  last_updated timestamptz,
  created_at timestamptz not null default now()
);

create table songs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null,
  created_at timestamptz not null default now(),
  unique (normalized_name)
);

create table show_songs (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references shows(id) on delete cascade,
  song_id uuid not null references songs(id) on delete cascade,
  position_overall integer not null,
  position_in_set integer,
  set_name text,
  is_encore boolean not null default false,
  is_tape boolean not null default false,
  info text,
  created_at timestamptz not null default now(),
  unique (show_id, position_overall)
);