export type AnalysisShow = {
  setlistfmId: string;
  eventDate: string | null;
  venueName: string | null;
  cityName: string | null;
  stateName: string | null;
  countryName: string | null;
  setlistfmUrl: string | null;
};

export type AnalysisShowSong = {
  showSetlistfmId: string;
  songName: string;
  songSlug: string;
  setIndex: number;
  setName: string | null;
  encore: number | null;
  positionInSet: number;
  absolutePosition: number;
  isTape: boolean;
  isCover: boolean;
};

export type PreparedShow = AnalysisShow & {
  showIndex: number;
  songs: AnalysisShowSong[];
  songSlugs: string[];
};

export type SongChangeItem = {
  songName: string;
  songSlug: string;
  position: number | null;
};

export type MovedSong = {
  songName: string;
  songSlug: string;
  fromPosition: number;
  toPosition: number;
  positionChange: number;
  fromSetName: string | null;
  toSetName: string | null;
};

export type SetlistChange = {
  fromShowId: string;
  toShowId: string;
  fromShowIndex: number;
  toShowIndex: number;
  addedSongs: SongChangeItem[];
  removedSongs: SongChangeItem[];
  movedSongs: MovedSong[];
};

export type SongStats = {
  songName: string;
  songSlug: string;
  totalShows: number;
  showCount: number;
  frequency: number;
  averagePosition: number | null;
  firstSeenShowIndex: number | null;
  lastSeenShowIndex: number | null;
  openerCount: number;
  closerCount: number;
  encoreCount: number;
  tapeCount: number;
  positions: number[];
  isCore: boolean;
  isRotating: boolean;
};

export type StabilityPairScore = {
  fromShowId: string;
  toShowId: string;
  fromShowIndex: number;
  toShowIndex: number;
  jaccardSimilarity: number;
  positionSimilarity: number;
  score: number;
};

export type TourStabilityScore = {
  totalShows: number;
  averageJaccardSimilarity: number;
  averagePositionSimilarity: number;
  score: number;
  interpretation: string;
  pairScores: StabilityPairScore[];
};

export type TourAnalysis = {
  shows: PreparedShow[];
  changes: SetlistChange[];
  songStats: SongStats[];
  stability: TourStabilityScore;
};