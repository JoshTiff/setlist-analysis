export type SetlistFmArtist = {
  mbid: string;
  name: string;
  sortName?: string;
  disambiguation?: string;
  url?: string;
};

export type SetlistFmArtistsResponse = {
  artist?: SetlistFmArtist[];
  total: number;
  page: number;
  itemsPerPage: number;
};

export type SetlistFmCity = {
  id?: string;
  name?: string;
  state?: string;
  stateCode?: string;
  coords?: {
    lat?: number;
    long?: number;
  };
  country?: {
    code?: string;
    name?: string;
  };
};

export type SetlistFmVenue = {
  id?: string;
  name?: string;
  url?: string;
  city?: SetlistFmCity;
};

export type SetlistFmTour = {
  name?: string;
};

export type SetlistFmSong = {
  name: string;
  info?: string;
  tape?: boolean;
  cover?: SetlistFmArtist;
  with?: SetlistFmArtist;
};

export type SetlistFmSet = {
  name?: string;
  encore?: number;
  song?: SetlistFmSong[];
};

export type SetlistFmSetlist = {
  id: string;
  versionId?: string;
  eventDate: string;
  lastUpdated?: string;
  url?: string;
  info?: string;
  artist: SetlistFmArtist;
  venue?: SetlistFmVenue;
  tour?: SetlistFmTour;
  set?: SetlistFmSet[];
};

export type SetlistFmSetlistsResponse = {
  setlist?: SetlistFmSetlist[];
  total: number;
  page: number;
  itemsPerPage: number;
};

export type SearchSetlistsByArtistArgs = {
  artistMbid?: string;
  artistName?: string;
  page?: number;
};