import "server-only";

import type { AnalysisShow, AnalysisShowSong } from "@/lib/analysis";
import { analyzeTourSetlists } from "@/lib/analysis";

import { createAdminSupabaseClient } from "./admin";

export type CachedTourDashboardData = {
  artist: {
    mbid: string;
    name: string;
    slug: string;
    setlistfmUrl: string | null;
  };
  tour: {
    id: string;
    name: string;
    slug: string;
  };
  refreshedAt: string | null;
  analysis: ReturnType<typeof analyzeTourSetlists>;
};

export async function getCachedTourDashboardData(
  artistSlug: string,
  tourSlug: string
): Promise<CachedTourDashboardData | null> {
  const supabase = createAdminSupabaseClient();

  const { data: artist, error: artistError } = await supabase
    .from("artists")
    .select("mbid, name, slug, setlistfm_url")
    .eq("slug", artistSlug)
    .maybeSingle();

  if (artistError) {
    throw new Error(`Failed to fetch artist: ${artistError.message}`);
  }

  if (!artist) {
    return null;
  }

  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("id, artist_mbid, name, slug")
    .eq("artist_mbid", artist.mbid)
    .eq("slug", tourSlug)
    .maybeSingle();

  if (tourError) {
    throw new Error(`Failed to fetch tour: ${tourError.message}`);
  }

  if (!tour) {
    return null;
  }

  const { data: shows, error: showsError } = await supabase
    .from("shows")
    .select(
      `
      setlistfm_id,
      event_date,
      venue_name,
      city_name,
      state_name,
      country_name,
      setlistfm_url,
      refreshed_at
    `
    )
    .eq("artist_mbid", artist.mbid)
    .eq("tour_slug", tour.slug)
    .order("event_date", { ascending: true });

  if (showsError) {
    throw new Error(`Failed to fetch shows: ${showsError.message}`);
  }

  const showIds = (shows ?? []).map((show) => show.setlistfm_id);

  if (showIds.length === 0) {
    return {
      artist: {
        mbid: artist.mbid,
        name: artist.name,
        slug: artist.slug,
        setlistfmUrl: artist.setlistfm_url,
      },
      tour: {
        id: tour.id,
        name: tour.name,
        slug: tour.slug,
      },
      refreshedAt: null,
      analysis: analyzeTourSetlists([], []),
    };
  }

  const { data: showSongs, error: showSongsError } = await supabase
    .from("show_songs")
    .select(
      `
      show_setlistfm_id,
      song_name,
      song_slug,
      set_index,
      set_name,
      encore,
      position_in_set,
      absolute_position,
      is_tape,
      is_cover
    `
    )
    .in("show_setlistfm_id", showIds)
    .order("show_setlistfm_id", { ascending: true })
    .order("absolute_position", { ascending: true });

  if (showSongsError) {
    throw new Error(`Failed to fetch show songs: ${showSongsError.message}`);
  }

  const analysisShows: AnalysisShow[] = (shows ?? []).map((show) => ({
    setlistfmId: show.setlistfm_id,
    eventDate: show.event_date,
    venueName: show.venue_name,
    cityName: show.city_name,
    stateName: show.state_name,
    countryName: show.country_name,
    setlistfmUrl: show.setlistfm_url,
  }));

  const analysisShowSongs: AnalysisShowSong[] = (showSongs ?? []).map(
    (showSong) => ({
      showSetlistfmId: showSong.show_setlistfm_id,
      songName: showSong.song_name,
      songSlug: showSong.song_slug,
      setIndex: showSong.set_index,
      setName: showSong.set_name,
      encore: showSong.encore,
      positionInSet: showSong.position_in_set,
      absolutePosition: showSong.absolute_position,
      isTape: showSong.is_tape,
      isCover: showSong.is_cover,
    })
  );

  const refreshedAt =
    shows
      ?.map((show) => show.refreshed_at)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;

  return {
    artist: {
      mbid: artist.mbid,
      name: artist.name,
      slug: artist.slug,
      setlistfmUrl: artist.setlistfm_url,
    },
    tour: {
      id: tour.id,
      name: tour.name,
      slug: tour.slug,
    },
    refreshedAt,
    analysis: analyzeTourSetlists(analysisShows, analysisShowSongs),
  };
}