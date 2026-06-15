import type {
  AnalysisShowSong,
  PreparedShow,
  StabilityPairScore,
  TourStabilityScore,
} from "./types";

export function getTourStabilityScore(
  shows: PreparedShow[]
): TourStabilityScore {
  if (shows.length < 2) {
    return {
      totalShows: shows.length,
      averageJaccardSimilarity: 1,
      averagePositionSimilarity: 1,
      score: 100,
      interpretation: "Not enough shows to compare yet.",
      pairScores: [],
    };
  }

  const pairScores: StabilityPairScore[] = [];

  for (let index = 1; index < shows.length; index++) {
    pairScores.push(compareShowStability(shows[index - 1], shows[index]));
  }

  const averageJaccardSimilarity = average(
    pairScores.map((pair) => pair.jaccardSimilarity)
  );

  const averagePositionSimilarity = average(
    pairScores.map((pair) => pair.positionSimilarity)
  );

  const score = Math.round(
    ((averageJaccardSimilarity * 0.7 + averagePositionSimilarity * 0.3) * 100 +
      Number.EPSILON) *
      100
  ) / 100;

  return {
    totalShows: shows.length,
    averageJaccardSimilarity,
    averagePositionSimilarity,
    score,
    interpretation: getStabilityInterpretation(score),
    pairScores,
  };
}

function compareShowStability(
  fromShow: PreparedShow,
  toShow: PreparedShow
): StabilityPairScore {
  const fromSlugs = new Set(fromShow.songSlugs);
  const toSlugs = new Set(toShow.songSlugs);

  const intersectionSize = getIntersectionSize(fromSlugs, toSlugs);
  const unionSize = getUnionSize(fromSlugs, toSlugs);

  const jaccardSimilarity = unionSize === 0 ? 1 : intersectionSize / unionSize;
  const positionSimilarity = getPositionSimilarity(fromShow.songs, toShow.songs);

  const score = jaccardSimilarity * 0.7 + positionSimilarity * 0.3;

  return {
    fromShowId: fromShow.setlistfmId,
    toShowId: toShow.setlistfmId,
    fromShowIndex: fromShow.showIndex,
    toShowIndex: toShow.showIndex,
    jaccardSimilarity,
    positionSimilarity,
    score,
  };
}

function getPositionSimilarity(
  fromSongs: AnalysisShowSong[],
  toSongs: AnalysisShowSong[]
): number {
  const fromSongsBySlug = getFirstSongBySlug(fromSongs);
  const toSongsBySlug = getFirstSongBySlug(toSongs);

  const sharedSongScores: number[] = [];

  for (const [songSlug, fromSong] of fromSongsBySlug.entries()) {
    const toSong = toSongsBySlug.get(songSlug);

    if (!toSong) {
      continue;
    }

    const maxSetlistLength = Math.max(fromSongs.length, toSongs.length, 1);
    const positionDistance = Math.abs(
      toSong.absolutePosition - fromSong.absolutePosition
    );

    const songPositionSimilarity = Math.max(
      0,
      1 - positionDistance / maxSetlistLength
    );

    sharedSongScores.push(songPositionSimilarity);
  }

  if (sharedSongScores.length === 0) {
    return fromSongs.length === 0 && toSongs.length === 0 ? 1 : 0;
  }

  return average(sharedSongScores);
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

function getIntersectionSize<T>(left: Set<T>, right: Set<T>): number {
  let count = 0;

  for (const item of left) {
    if (right.has(item)) {
      count += 1;
    }
  }

  return count;
}

function getUnionSize<T>(left: Set<T>, right: Set<T>): number {
  return new Set([...left, ...right]).size;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return total / values.length;
}

function getStabilityInterpretation(score: number): string {
  if (score >= 85) {
    return "Very stable setlist";
  }

  if (score >= 70) {
    return "Mostly stable setlist";
  }

  if (score >= 50) {
    return "Moderately changing setlist";
  }

  return "Highly variable setlist";
}