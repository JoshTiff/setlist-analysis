import type { AnalysisShowSong, PreparedShow, SongStats } from "./types";

export type GetSongStatsOptions = {
  coreThreshold?: number;
  rotatingThreshold?: number;
};

type SongAccumulator = {
  songName: string;
  songSlug: string;
  showIndexes: number[];
  positions: number[];
  openerCount: number;
  closerCount: number;
  encoreCount: number;
  tapeCount: number;
};

export function getSongStats(
  shows: PreparedShow[],
  options: GetSongStatsOptions = {}
): SongStats[] {
  const totalShows = shows.length;
  const coreThreshold = options.coreThreshold ?? 0.8;
  const rotatingThreshold = options.rotatingThreshold ?? 0.4;

  const statsBySongSlug = new Map<string, SongAccumulator>();

  for (const show of shows) {
    const firstSongsBySlug = getFirstSongBySlug(show.songs);
    const opener = show.songs[0] ?? null;
    const closer = show.songs[show.songs.length - 1] ?? null;

    for (const song of firstSongsBySlug.values()) {
      const existing = statsBySongSlug.get(song.songSlug) ?? {
        songName: song.songName,
        songSlug: song.songSlug,
        showIndexes: [],
        positions: [],
        openerCount: 0,
        closerCount: 0,
        encoreCount: 0,
        tapeCount: 0,
      };

      existing.showIndexes.push(show.showIndex);
      existing.positions.push(song.absolutePosition);

      if (opener?.songSlug === song.songSlug) {
        existing.openerCount += 1;
      }

      if (closer?.songSlug === song.songSlug) {
        existing.closerCount += 1;
      }

      if (song.encore !== null) {
        existing.encoreCount += 1;
      }

      if (song.isTape) {
        existing.tapeCount += 1;
      }

      statsBySongSlug.set(song.songSlug, existing);
    }
  }

  return Array.from(statsBySongSlug.values())
    .map((song): SongStats => {
      const showCount = song.showIndexes.length;
      const frequency = totalShows > 0 ? showCount / totalShows : 0;

      return {
        songName: song.songName,
        songSlug: song.songSlug,
        totalShows,
        showCount,
        frequency,
        averagePosition: average(song.positions),
        firstSeenShowIndex: Math.min(...song.showIndexes),
        lastSeenShowIndex: Math.max(...song.showIndexes),
        openerCount: song.openerCount,
        closerCount: song.closerCount,
        encoreCount: song.encoreCount,
        tapeCount: song.tapeCount,
        positions: song.positions,
        isCore: frequency >= coreThreshold,
        isRotating: frequency > 0 && frequency <= rotatingThreshold,
      };
    })
    .sort((a, b) => {
      const frequencyComparison = b.frequency - a.frequency;

      if (frequencyComparison !== 0) {
        return frequencyComparison;
      }

      return a.songName.localeCompare(b.songName);
    });
}

function getFirstSongBySlug(
  songs: AnalysisShowSong[]
): Map<string, AnalysisShowSong> {
  const songsBySlug = new Map<string, AnalysisShowSong>();

  for (const song of songs) {
    if (!songsBySlug.has(song.songSlug)) {
      songsBySlug.set(song.songSlug, song);
    }
  }

  return songsBySlug;
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return total / values.length;
}