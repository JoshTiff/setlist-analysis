export type Artist = {
  id: string;
  name: string;
  slug: string;
  mbid: string | null;
};

export type Show = {
  id: string;
  setlistfmId: string;
  eventDate: string;
  venueName: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  setlistUrl: string | null;
};

export type ShowSong = {
  showId: string;
  songName: string;
  positionOverall: number;
  positionInSet: number | null;
  setName: string | null;
  isEncore: boolean;
  isTape: boolean;
  info: string | null;
};