import { type NextRequest, NextResponse } from "next/server";

import { searchArtists, SetlistFmApiError } from "@/lib/setlistfm/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const pageParam = request.nextUrl.searchParams.get("page");

  const page = pageParam ? Number(pageParam) : 1;

  if (!query || query.length < 2) {
    return NextResponse.json(
      {
        error: "Search query must be at least 2 characters.",
      },
      { status: 400 }
    );
  }

  if (!Number.isInteger(page) || page < 1) {
    return NextResponse.json(
      {
        error: "Page must be a positive integer.",
      },
      { status: 400 }
    );
  }

  try {
    const data = await searchArtists(query, page);

    const artists = (data.artist ?? []).map((artist) => ({
      mbid: artist.mbid,
      name: artist.name,
      sortName: artist.sortName ?? null,
      disambiguation: artist.disambiguation ?? null,
      url: artist.url ?? null,
    }));

    return NextResponse.json({
      artists,
      total: data.total,
      page: data.page,
      itemsPerPage: data.itemsPerPage,
    });
  } catch (error) {
    console.error("Artist search failed:", error);

    if (error instanceof SetlistFmApiError) {
      return NextResponse.json(
        {
          error: "Failed to search artists from setlist.fm.",
          status: error.status,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: "Unexpected error while searching artists.",
      },
      { status: 500 }
    );
  }
}