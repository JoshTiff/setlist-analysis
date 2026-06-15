import { type NextRequest, NextResponse } from "next/server";

import { normalizeSetlistFmSetlists } from "@/lib/data";
import {
  searchSetlistsByArtist,
  SetlistFmApiError,
} from "@/lib/setlistfm/client";
import type { SetlistFmSetlist } from "@/lib/setlistfm/types";
import { writeNormalizedSetlistData } from "@/lib/supabase/writeSetlistData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RefreshSetlistsRequestBody = {
  artistMbid?: unknown;
  artistName?: unknown;
  page?: unknown;
  pages?: unknown;
};

const MAX_PAGES_PER_REFRESH = 5;

export async function POST(request: NextRequest) {
  let body: RefreshSetlistsRequestBody;

  try {
    body = (await request.json()) as RefreshSetlistsRequestBody;
  } catch {
    return NextResponse.json(
      {
        error: "Request body must be valid JSON.",
      },
      { status: 400 }
    );
  }

  const artistMbid =
    typeof body.artistMbid === "string" ? body.artistMbid.trim() : "";
  const artistName =
    typeof body.artistName === "string" ? body.artistName.trim() : "";

  const startPage = getPositiveInteger(body.page, 1);
  const pagesToFetch = Math.min(
    getPositiveInteger(body.pages, 1),
    MAX_PAGES_PER_REFRESH
  );

  if (!artistMbid && !artistName) {
    return NextResponse.json(
      {
        error: "Provide artistMbid or artistName.",
      },
      { status: 400 }
    );
  }

  try {
    const setlists: SetlistFmSetlist[] = [];
    let totalFromSetlistFm: number | null = null;
    let pagesFetched = 0;

    for (let offset = 0; offset < pagesToFetch; offset++) {
      const page = startPage + offset;

      const response = await searchSetlistsByArtist({
        artistMbid: artistMbid || undefined,
        artistName: artistName || undefined,
        page,
      });

      const pageSetlists = response.setlist ?? [];

      setlists.push(...pageSetlists);
      totalFromSetlistFm = response.total;
      pagesFetched += 1;

      if (pageSetlists.length === 0) {
        break;
      }

      if (setlists.length >= response.total) {
        break;
      }
    }

    const normalized = normalizeSetlistFmSetlists(setlists);
    const writeResult = await writeNormalizedSetlistData(normalized);

    return NextResponse.json({
      ok: true,
      artistMbid: artistMbid || null,
      artistName: artistName || null,
      startPage,
      pagesRequested: pagesToFetch,
      pagesFetched,
      totalFromSetlistFm,
      setlistsFetched: setlists.length,
      cached: writeResult,
    });
  } catch (error) {
    console.error("Setlist refresh failed:", error);

    if (error instanceof SetlistFmApiError) {
      return NextResponse.json(
        {
          error: "setlist.fm request failed.",
          status: error.status,
        },
        { status: 502 }
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while refreshing setlists.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}

function getPositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== "number") {
    return fallback;
  }

  if (!Number.isInteger(value) || value < 1) {
    return fallback;
  }

  return value;
}