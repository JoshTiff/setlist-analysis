create table public.artists (
  mbid text primary key,
  name text not null,
  sort_name text,
  disambiguation text,
  slug text not null unique,
  setlistfm_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tours (
  id uuid primary key default gen_random_uuid(),
  artist_mbid text not null references public.artists(mbid) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artist_mbid, slug)
);

create table public.shows (
  setlistfm_id text primary key,
  version_id text,
  artist_mbid text not null references public.artists(mbid) on delete cascade,
  tour_id uuid references public.tours(id) on delete set null,
  tour_name text not null,
  tour_slug text not null,
  event_date date,
  venue_name text,
  city_name text,
  state_name text,
  state_code text,
  country_name text,
  country_code text,
  setlistfm_url text,
  info text,
  last_updated timestamptz,
  refreshed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.songs (
  id uuid primary key default gen_random_uuid(),
  artist_mbid text not null references public.artists(mbid) on delete cascade,
  name text not null,
  normalized_name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artist_mbid, slug)
);

create table public.show_songs (
  id uuid primary key default gen_random_uuid(),
  show_setlistfm_id text not null references public.shows(setlistfm_id) on delete cascade,
  artist_mbid text not null references public.artists(mbid) on delete cascade,
  song_id uuid references public.songs(id) on delete set null,
  song_name text not null,
  song_slug text not null,
  set_index integer not null,
  set_name text,
  encore integer,
  position_in_set integer not null,
  absolute_position integer not null,
  info text,
  is_tape boolean not null default false,
  is_cover boolean not null default false,
  cover_artist_mbid text,
  cover_artist_name text,
  created_at timestamptz not null default now(),
  unique (show_setlistfm_id, absolute_position)
);

create index shows_artist_mbid_idx on public.shows(artist_mbid);
create index shows_tour_slug_idx on public.shows(artist_mbid, tour_slug);
create index shows_event_date_idx on public.shows(event_date);

create index songs_artist_mbid_idx on public.songs(artist_mbid);
create index show_songs_show_setlistfm_id_idx on public.show_songs(show_setlistfm_id);
create index show_songs_song_id_idx on public.show_songs(song_id);

notify pgrst, 'reload schema';