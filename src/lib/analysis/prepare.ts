import type {
  AnalysisShow,
  AnalysisShowSong,
  PreparedShow,
} from "./types";

export type PrepareTourAnalysisOptions = {
  includeTapes?: boolean;
};

export function prepareTourAnalysisData(
  shows: AnalysisShow[],
  showSongs: AnalysisShowSong[],
  options: PrepareTourAnalysisOptions = {}
): PreparedShow[] {
  const includeTapes = options.includeTapes ?? false;

  const songsByShowId = new Map<string, AnalysisShowSong[]>();

  for (const showSong of showSongs) {
    if (!includeTapes && showSong.isTape) {
      continue;
    }

    const existingSongs = songsByShowId.get(showSong.showSetlistfmId) ?? [];
    existingSongs.push(showSong);
    songsByShowId.set(showSong.showSetlistfmId, existingSongs);
  }

  return [...shows]
    .sort(sortShows)
    .map((show, index) => {
      const songs = (songsByShowId.get(show.setlistfmId) ?? []).sort(
        (a, b) => a.absolutePosition - b.absolutePosition
      );

      return {
        ...show,
        showIndex: index + 1,
        songs,
        songSlugs: getUniqueSongSlugs(songs),
      };
    });
}

function getUniqueSongSlugs(songs: AnalysisShowSong[]): string[] {
  const seen = new Set<string>();
  const uniqueSlugs: string[] = [];

  for (const song of songs) {
    if (!seen.has(song.songSlug)) {
      seen.add(song.songSlug);
      uniqueSlugs.push(song.songSlug);
    }
  }

  return uniqueSlugs;
}

function sortShows(a: AnalysisShow, b: AnalysisShow): number {
  if (a.eventDate && b.eventDate) {
    const dateComparison = a.eventDate.localeCompare(b.eventDate);

    if (dateComparison !== 0) {
      return dateComparison;
    }
  }

  if (a.eventDate && !b.eventDate) {
    return -1;
  }

  if (!a.eventDate && b.eventDate) {
    return 1;
  }

  return a.setlistfmId.localeCompare(b.setlistfmId);
}