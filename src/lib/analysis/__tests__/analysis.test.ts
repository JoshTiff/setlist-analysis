import { describe, expect, it } from "vitest";

import {
  analyzeTourSetlists,
  getSetlistChanges,
  getSongStats,
  getTourStabilityScore,
  prepareTourAnalysisData,
} from "@/lib/analysis";

import type { AnalysisShow, AnalysisShowSong } from "@/lib/analysis";

const shows: AnalysisShow[] = [
  {
    setlistfmId: "show-1",
    eventDate: "2026-06-01",
    venueName: "Venue One",
    cityName: "Chicago",
    stateName: "Illinois",
    countryName: "USA",
    setlistfmUrl: "https://example.com/show-1",
  },
  {
    setlistfmId: "show-2",
    eventDate: "2026-06-02",
    venueName: "Venue Two",
    cityName: "Milwaukee",
    stateName: "Wisconsin",
    countryName: "USA",
    setlistfmUrl: "https://example.com/show-2",
  },
  {
    setlistfmId: "show-3",
    eventDate: "2026-06-03",
    venueName: "Venue Three",
    cityName: "Madison",
    stateName: "Wisconsin",
    countryName: "USA",
    setlistfmUrl: "https://example.com/show-3",
  },
];

const showSongs: AnalysisShowSong[] = [
  makeSong("show-1", "Intro Tape", "intro-tape", 1, {
    isTape: true,
  }),
  makeSong("show-1", "Opener", "opener", 2),
  makeSong("show-1", "Core Song", "core-song", 3),
  makeSong("show-1", "Rotating A", "rotating-a", 4),
  makeSong("show-1", "Closer", "closer", 5),

  makeSong("show-2", "Opener", "opener", 1),
  makeSong("show-2", "Core Song", "core-song", 2),
  makeSong("show-2", "Rotating B", "rotating-b", 3),
  makeSong("show-2", "Closer", "closer", 4, {
    encore: 1,
    setName: "Encore",
  }),

  makeSong("show-3", "Core Song", "core-song", 1),
  makeSong("show-3", "Opener", "opener", 2),
  makeSong("show-3", "Rotating B", "rotating-b", 3),
  makeSong("show-3", "Closer", "closer", 4),
];

describe("prepareTourAnalysisData", () => {
  it("sorts shows by event date and removes tape songs by default", () => {
    const prepared = prepareTourAnalysisData(shows, showSongs);

    expect(prepared).toHaveLength(3);
    expect(prepared[0].setlistfmId).toBe("show-1");
    expect(prepared[0].showIndex).toBe(1);
    expect(prepared[0].songs.map((song) => song.songSlug)).toEqual([
      "opener",
      "core-song",
      "rotating-a",
      "closer",
    ]);
  });

  it("can include tape songs when requested", () => {
    const prepared = prepareTourAnalysisData(shows, showSongs, {
      includeTapes: true,
    });

    expect(prepared[0].songs.map((song) => song.songSlug)).toEqual([
      "intro-tape",
      "opener",
      "core-song",
      "rotating-a",
      "closer",
    ]);
  });
});

describe("getSetlistChanges", () => {
  it("detects added, removed, and moved songs between adjacent shows", () => {
    const prepared = prepareTourAnalysisData(shows, showSongs);
    const changes = getSetlistChanges(prepared);

    expect(changes).toHaveLength(2);

    expect(changes[0].fromShowId).toBe("show-1");
    expect(changes[0].toShowId).toBe("show-2");

    expect(changes[0].addedSongs.map((song) => song.songSlug)).toEqual([
      "rotating-b",
    ]);

    expect(changes[0].removedSongs.map((song) => song.songSlug)).toEqual([
      "rotating-a",
    ]);

    expect(changes[0].movedSongs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          songSlug: "opener",
          fromPosition: 2,
          toPosition: 1,
          positionChange: -1,
        }),
        expect.objectContaining({
          songSlug: "core-song",
          fromPosition: 3,
          toPosition: 2,
          positionChange: -1,
        }),
        expect.objectContaining({
          songSlug: "closer",
          fromPosition: 5,
          toPosition: 4,
          positionChange: -1,
        }),
      ])
    );
  });
});

describe("getSongStats", () => {
  it("calculates frequency, average position, opener count, closer count, and encore count", () => {
    const prepared = prepareTourAnalysisData(shows, showSongs);
    const stats = getSongStats(prepared);

    const coreSong = stats.find((song) => song.songSlug === "core-song");
    const opener = stats.find((song) => song.songSlug === "opener");
    const closer = stats.find((song) => song.songSlug === "closer");
    const rotatingA = stats.find((song) => song.songSlug === "rotating-a");

    expect(coreSong).toMatchObject({
      showCount: 3,
      frequency: 1,
      isCore: true,
      isRotating: false,
    });

    expect(coreSong?.averagePosition).toBe(2);

    expect(opener?.openerCount).toBe(2);
    expect(closer?.closerCount).toBe(3);
    expect(closer?.encoreCount).toBe(1);

    expect(rotatingA).toMatchObject({
      showCount: 1,
      frequency: 1 / 3,
      isCore: false,
      isRotating: true,
    });
  });
});

describe("getTourStabilityScore", () => {
  it("returns a stability score between 0 and 100", () => {
    const prepared = prepareTourAnalysisData(shows, showSongs);
    const stability = getTourStabilityScore(prepared);

    expect(stability.totalShows).toBe(3);
    expect(stability.pairScores).toHaveLength(2);
    expect(stability.score).toBeGreaterThanOrEqual(0);
    expect(stability.score).toBeLessThanOrEqual(100);
  });

  it("returns a perfect score when there is only one show", () => {
    const prepared = prepareTourAnalysisData([shows[0]], showSongs);
    const stability = getTourStabilityScore(prepared);

    expect(stability.totalShows).toBe(1);
    expect(stability.score).toBe(100);
    expect(stability.interpretation).toBe("Not enough shows to compare yet.");
  });
});

describe("analyzeTourSetlists", () => {
  it("returns prepared shows, changes, song stats, and stability in one object", () => {
    const analysis = analyzeTourSetlists(shows, showSongs);

    expect(analysis.shows).toHaveLength(3);
    expect(analysis.changes).toHaveLength(2);
    expect(analysis.songStats.length).toBeGreaterThan(0);
    expect(analysis.stability.totalShows).toBe(3);
  });
});

function makeSong(
  showSetlistfmId: string,
  songName: string,
  songSlug: string,
  absolutePosition: number,
  overrides: Partial<AnalysisShowSong> = {}
): AnalysisShowSong {
  return {
    showSetlistfmId,
    songName,
    songSlug,
    setIndex: 1,
    setName: null,
    encore: null,
    positionInSet: absolutePosition,
    absolutePosition,
    isTape: false,
    isCover: false,
    ...overrides,
  };
}