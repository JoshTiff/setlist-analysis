import { getSetlistChanges } from "./changes";
import { prepareTourAnalysisData } from "./prepare";
import { getSongStats } from "./songStats";
import { getTourStabilityScore } from "./stability";
import type {
  AnalysisShow,
  AnalysisShowSong,
  TourAnalysis,
} from "./types";

export * from "./changes";
export * from "./prepare";
export * from "./songStats";
export * from "./stability";
export * from "./types";

export function analyzeTourSetlists(
  shows: AnalysisShow[],
  showSongs: AnalysisShowSong[]
): TourAnalysis {
  const preparedShows = prepareTourAnalysisData(shows, showSongs);
  const changes = getSetlistChanges(preparedShows);
  const songStats = getSongStats(preparedShows);
  const stability = getTourStabilityScore(preparedShows);

  return {
    shows: preparedShows,
    changes,
    songStats,
    stability,
  };
}