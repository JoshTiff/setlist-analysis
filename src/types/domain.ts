export type ArtistRecord = {
  mbid: string;
  name: string;
  sortName: string | null;
  disambiguation: string | null;
  slug: string;
  setlistfmUrl: string | null;
};

export type TourRecord = {
  artistMbid: string;
  name: string;
  slug: string;
};

export type ShowRecord = {
  setlistfmId: string;
  versionId: string | null;
  artistMbid: string;
  tourName: string;
  tourSlug: string;
  eventDate: string | null;
  venueName: string | null;
  cityName: string | null;
  stateName: string | null;
  stateCode: string | null;
  countryName: string | null;
  countryCode: string | null;
  setlistfmUrl: string | null;
  info: string | null;
  lastUpdated: string | null;
};

export type SongRecord = {
  artistMbid: string;
  name: string;
  normalizedName: string;
  slug: string;
};

export type ShowSongRecord = {
  showSetlistfmId: string;
  artistMbid: string;
  songName: string;
  songSlug: string;
  setIndex: number;
  setName: string | null;
  encore: number | null;
  positionInSet: number;
  absolutePosition: number;
  info: string | null;
  isTape: boolean;
  isCover: boolean;
  coverArtistMbid: string | null;
  coverArtistName: string | null;
};

export type NormalizedSetlistData = {
  artists: ArtistRecord[];
  tours: TourRecord[];
  shows: ShowRecord[];
  songs: SongRecord[];
  showSongs: ShowSongRecord[];
};