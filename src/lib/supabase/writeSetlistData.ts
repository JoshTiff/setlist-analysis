import "server-only";

import type { NormalizedSetlistData } from "@/types/domain";

import { createAdminSupabaseClient } from "./admin";
import type { Database } from "./database.types";

type ArtistInsert = Database["public"]["Tables"]["artists"]["Insert"];
type TourInsert = Database["public"]["Tables"]["tours"]["Insert"];
type ShowInsert = Database["public"]["Tables"]["shows"]["Insert"];
type SongInsert = Database["public"]["Tables"]["songs"]["Insert"];
type ShowSongInsert = Database["public"]["Tables"]["show_songs"]["Insert"];

type TourIdRow = {
  id: string;
  artist_mbid: string;
  slug: string;
};

type SongIdRow = {
  id: string;
  artist_mbid: string;
  slug: string;
};

export type WriteSetlistDataResult = {
  artists: number;
  tours: number;
  shows: number;
  songs: number;
  showSongs: number;
  refreshedShowIds: string[];
};

export async function writeNormalizedSetlistData(
  data: NormalizedSetlistData
): Promise<WriteSetlistDataResult> {
  const supabase = createAdminSupabaseClient();
  const now = new Date().toISOString();

  const artistRows: ArtistInsert[] = data.artists.map((artist) => ({
    mbid: artist.mbid,
    name: artist.name,
    sort_name: artist.sortName,
    disambiguation: artist.disambiguation,
    slug: artist.slug,
    setlistfm_url: artist.setlistfmUrl,
    updated_at: now,
  }));

  if (artistRows.length > 0) {
    const { error } = await supabase
      .from("artists")
      .upsert(artistRows, { onConflict: "mbid" });

    if (error) {
      throw new Error(`Failed to upsert artists: ${error.message}`);
    }
  }

  const tourRows: TourInsert[] = data.tours.map((tour) => ({
    artist_mbid: tour.artistMbid,
    name: tour.name,
    slug: tour.slug,
    updated_at: now,
  }));

  let upsertedTours: TourIdRow[] = [];

  if (tourRows.length > 0) {
    const { data: tours, error } = await supabase
      .from("tours")
      .upsert(tourRows, { onConflict: "artist_mbid,slug" })
      .select("id, artist_mbid, slug");

    if (error) {
      throw new Error(`Failed to upsert tours: ${error.message}`);
    }

    upsertedTours = tours ?? [];
  }

  const tourIdByKey = new Map<string, string>();

  for (const tour of upsertedTours) {
    tourIdByKey.set(getCompositeKey(tour.artist_mbid, tour.slug), tour.id);
  }

  const songRows: SongInsert[] = data.songs.map((song) => ({
    artist_mbid: song.artistMbid,
    name: song.name,
    normalized_name: song.normalizedName,
    slug: song.slug,
    updated_at: now,
  }));

  let upsertedSongs: SongIdRow[] = [];

  if (songRows.length > 0) {
    const { data: songs, error } = await supabase
      .from("songs")
      .upsert(songRows, { onConflict: "artist_mbid,slug" })
      .select("id, artist_mbid, slug");

    if (error) {
      throw new Error(`Failed to upsert songs: ${error.message}`);
    }

    upsertedSongs = songs ?? [];
  }

  const songIdByKey = new Map<string, string>();

  for (const song of upsertedSongs) {
    songIdByKey.set(getCompositeKey(song.artist_mbid, song.slug), song.id);
  }

  const showRows: ShowInsert[] = data.shows.map((show) => ({
    setlistfm_id: show.setlistfmId,
    version_id: show.versionId,
    artist_mbid: show.artistMbid,
    tour_id:
      tourIdByKey.get(getCompositeKey(show.artistMbid, show.tourSlug)) ?? null,
    tour_name: show.tourName,
    tour_slug: show.tourSlug,
    event_date: show.eventDate,
    venue_name: show.venueName,
    city_name: show.cityName,
    state_name: show.stateName,
    state_code: show.stateCode,
    country_name: show.countryName,
    country_code: show.countryCode,
    setlistfm_url: show.setlistfmUrl,
    info: show.info,
    last_updated: show.lastUpdated,
    refreshed_at: now,
    updated_at: now,
  }));

  if (showRows.length > 0) {
    const { error } = await supabase
      .from("shows")
      .upsert(showRows, { onConflict: "setlistfm_id" });

    if (error) {
      throw new Error(`Failed to upsert shows: ${error.message}`);
    }
  }

  const refreshedShowIds = data.shows.map((show) => show.setlistfmId);

  if (refreshedShowIds.length > 0) {
    const { error } = await supabase
      .from("show_songs")
      .delete()
      .in("show_setlistfm_id", refreshedShowIds);

    if (error) {
      throw new Error(`Failed to delete old show songs: ${error.message}`);
    }
  }

  const showSongRows: ShowSongInsert[] = data.showSongs.map((showSong) => ({
    show_setlistfm_id: showSong.showSetlistfmId,
    artist_mbid: showSong.artistMbid,
    song_id:
      songIdByKey.get(
        getCompositeKey(showSong.artistMbid, showSong.songSlug)
      ) ?? null,
    song_name: showSong.songName,
    song_slug: showSong.songSlug,
    set_index: showSong.setIndex,
    set_name: showSong.setName,
    encore: showSong.encore,
    position_in_set: showSong.positionInSet,
    absolute_position: showSong.absolutePosition,
    info: showSong.info,
    is_tape: showSong.isTape,
    is_cover: showSong.isCover,
    cover_artist_mbid: showSong.coverArtistMbid,
    cover_artist_name: showSong.coverArtistName,
    created_at: now,
  }));

  if (showSongRows.length > 0) {
    const { error } = await supabase
      .from("show_songs")
      .insert(showSongRows);

    if (error) {
      throw new Error(`Failed to insert show songs: ${error.message}`);
    }
  }

  return {
    artists: artistRows.length,
    tours: tourRows.length,
    shows: showRows.length,
    songs: songRows.length,
    showSongs: showSongRows.length,
    refreshedShowIds,
  };
}

function getCompositeKey(left: string, right: string): string {
  return `${left}:${right}`;
}