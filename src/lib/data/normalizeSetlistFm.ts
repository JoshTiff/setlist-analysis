import type {
  ArtistRecord,
  NormalizedSetlistData,
  ShowRecord,
  ShowSongRecord,
  SongRecord,
  TourRecord,
} from "@/types/domain";

import type {
  SetlistFmSetlist,
  SetlistFmSetlistsResponse,
} from "@/lib/setlistfm/types";

import { parseSetlistFmEventDate } from "./dates";
import { normalizeSongName, normalizeText, toSlug } from "./slugs";

const UNKNOWN_TOUR_NAME = "Unknown Tour";

export function normalizeSetlistFmSetlistsResponse(
  response: SetlistFmSetlistsResponse
): NormalizedSetlistData {
  return normalizeSetlistFmSetlists(response.setlist ?? []);
}

export function normalizeSetlistFmSetlists(
  setlists: SetlistFmSetlist[]
): NormalizedSetlistData {
  const artistsByMbid = new Map<string, ArtistRecord>();
  const toursByKey = new Map<string, TourRecord>();
  const showsBySetlistfmId = new Map<string, ShowRecord>();
  const songsByKey = new Map<string, SongRecord>();
  const showSongs: ShowSongRecord[] = [];

  for (const setlist of setlists) {
    const artist = setlist.artist;

    if (!artist?.mbid || !artist.name) {
      continue;
    }

    const artistName = normalizeText(artist.name);
    const artistMbid = artist.mbid;
    const artistSlug = toSlug(artistName);

    artistsByMbid.set(artistMbid, {
      mbid: artistMbid,
      name: artistName,
      sortName: artist.sortName ? normalizeText(artist.sortName) : null,
      disambiguation: artist.disambiguation
        ? normalizeText(artist.disambiguation)
        : null,
      slug: artistSlug,
      setlistfmUrl: artist.url ?? null,
    });

    const tourName = getTourName(setlist);
    const tourSlug = toSlug(tourName);
    const tourKey = getTourKey(artistMbid, tourSlug);

    toursByKey.set(tourKey, {
      artistMbid,
      name: tourName,
      slug: tourSlug,
    });

    const city = setlist.venue?.city;
    const country = city?.country;

    showsBySetlistfmId.set(setlist.id, {
      setlistfmId: setlist.id,
      versionId: setlist.versionId ?? null,
      artistMbid,
      tourName,
      tourSlug,
      eventDate: parseSetlistFmEventDate(setlist.eventDate),
      venueName: setlist.venue?.name ? normalizeText(setlist.venue.name) : null,
      cityName: city?.name ? normalizeText(city.name) : null,
      stateName: city?.state ? normalizeText(city.state) : null,
      stateCode: city?.stateCode ?? null,
      countryName: country?.name ? normalizeText(country.name) : null,
      countryCode: country?.code ?? null,
      setlistfmUrl: setlist.url ?? null,
      info: setlist.info ? normalizeText(setlist.info) : null,
      lastUpdated: setlist.lastUpdated ?? null,
    });

    let absolutePosition = 0;

    for (let setIndex = 0; setIndex < (setlist.set?.length ?? 0); setIndex++) {
      const currentSet = setlist.set?.[setIndex];

      if (!currentSet?.song?.length) {
        continue;
      }

      const setName = currentSet.name ? normalizeText(currentSet.name) : null;
      const encore =
        typeof currentSet.encore === "number" ? currentSet.encore : null;

      for (
        let songIndex = 0;
        songIndex < currentSet.song.length;
        songIndex++
      ) {
        const currentSong = currentSet.song[songIndex];

        if (!currentSong?.name) {
          continue;
        }

        const songName = normalizeText(currentSong.name);

        if (!songName) {
          continue;
        }

        const normalizedName = normalizeSongName(songName);
        const songSlug = toSlug(normalizedName);
        const songKey = getSongKey(artistMbid, songSlug);

        songsByKey.set(songKey, {
          artistMbid,
          name: songName,
          normalizedName,
          slug: songSlug,
        });

        absolutePosition += 1;

        showSongs.push({
          showSetlistfmId: setlist.id,
          artistMbid,
          songName,
          songSlug,
          setIndex: setIndex + 1,
          setName,
          encore,
          positionInSet: songIndex + 1,
          absolutePosition,
          info: currentSong.info ? normalizeText(currentSong.info) : null,
          isTape: Boolean(currentSong.tape),
          isCover: Boolean(currentSong.cover),
          coverArtistMbid: currentSong.cover?.mbid ?? null,
          coverArtistName: currentSong.cover?.name
            ? normalizeText(currentSong.cover.name)
            : null,
        });
      }
    }
  }

  return {
    artists: Array.from(artistsByMbid.values()),
    tours: Array.from(toursByKey.values()),
    shows: Array.from(showsBySetlistfmId.values()).sort(sortShowsByDate),
    songs: Array.from(songsByKey.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    showSongs,
  };
}

function getTourName(setlist: SetlistFmSetlist): string {
  const rawTourName = setlist.tour?.name;

  if (!rawTourName) {
    return UNKNOWN_TOUR_NAME;
  }

  const normalizedTourName = normalizeText(rawTourName);

  return normalizedTourName || UNKNOWN_TOUR_NAME;
}

function getTourKey(artistMbid: string, tourSlug: string): string {
  return `${artistMbid}:${tourSlug}`;
}

function getSongKey(artistMbid: string, songSlug: string): string {
  return `${artistMbid}:${songSlug}`;
}

function sortShowsByDate(a: ShowRecord, b: ShowRecord): number {
  if (!a.eventDate && !b.eventDate) {
    return a.setlistfmId.localeCompare(b.setlistfmId);
  }

  if (!a.eventDate) {
    return 1;
  }

  if (!b.eventDate) {
    return -1;
  }

  return a.eventDate.localeCompare(b.eventDate);
}