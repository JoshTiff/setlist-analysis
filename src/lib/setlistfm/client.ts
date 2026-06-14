import "server-only";

import type {
  SearchSetlistsByArtistArgs,
  SetlistFmArtistsResponse,
  SetlistFmSetlistsResponse,
} from "./types";

const SETLISTFM_BASE_URL = "https://api.setlist.fm/rest/1.0";

type SetlistFmQueryParams = Record<string, string | number | undefined | null>;

export class SetlistFmApiError extends Error {
  status: number;
  responseText?: string;

  constructor(message: string, status: number, responseText?: string) {
    super(message);
    this.name = "SetlistFmApiError";
    this.status = status;
    this.responseText = responseText;
  }
}

function getSetlistFmApiKey(): string {
  const apiKey = process.env.SETLISTFM_API_KEY;

  if (!apiKey) {
    throw new Error("Missing SETLISTFM_API_KEY in environment variables.");
  }

  return apiKey;
}

function buildUrl(path: string, params: SetlistFmQueryParams = {}) {
  const url = new URL(`${SETLISTFM_BASE_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

async function setlistFmRequest<T>(
  path: string,
  params: SetlistFmQueryParams = {}
): Promise<T> {
  const url = buildUrl(path, params);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "x-api-key": getSetlistFmApiKey(),
    },

    // Supabase will become your real cache later.
    // For now, avoid accidentally caching API-development responses.
    cache: "no-store",
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => undefined);

    throw new SetlistFmApiError(
      `setlist.fm request failed with status ${response.status}`,
      response.status,
      responseText
    );
  }

  return response.json() as Promise<T>;
}

export async function searchArtists(
  query: string,
  page = 1
): Promise<SetlistFmArtistsResponse> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {
      artist: [],
      total: 0,
      page,
      itemsPerPage: 0,
    };
  }

  return setlistFmRequest<SetlistFmArtistsResponse>("/search/artists", {
    artistName: trimmedQuery,
    p: page,
    sort: "relevance",
  });
}

export async function searchSetlistsByArtist({
  artistMbid,
  artistName,
  page = 1,
}: SearchSetlistsByArtistArgs): Promise<SetlistFmSetlistsResponse> {
  if (!artistMbid && !artistName) {
    throw new Error("searchSetlistsByArtist requires artistMbid or artistName.");
  }

  return setlistFmRequest<SetlistFmSetlistsResponse>("/search/setlists", {
    artistMbid,
    artistName,
    p: page,
  });
}