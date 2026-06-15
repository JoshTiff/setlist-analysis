import type { TourAnalysis } from "@/lib/analysis";

import styles from "./SongHeatmap.module.css";

type SongHeatmapProps = {
  analysis: TourAnalysis;
  maxSongs?: number;
};

export function SongHeatmap({ analysis, maxSongs = 25 }: SongHeatmapProps) {
  const songs = analysis.songStats.slice(0, maxSongs);
  const shows = analysis.shows;

  if (songs.length === 0 || shows.length === 0) {
    return (
      <p className={styles.empty}>
        No heatmap data available yet. Refresh setlists for this tour first.
      </p>
    );
  }

  const positionLookup = buildPositionLookup(analysis);

  return (
    <div className={styles.wrapper}>
      <table className={styles.heatmap}>
        <thead>
          <tr>
            <th className={styles.songHeader}>Song</th>
            {shows.map((show) => (
              <th key={show.setlistfmId} title={show.eventDate ?? undefined}>
                {show.showIndex}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {songs.map((song) => (
            <tr key={song.songSlug}>
              <th className={styles.songName}>{song.songName}</th>

              {shows.map((show) => {
                const position =
                  positionLookup
                    .get(show.setlistfmId)
                    ?.get(song.songSlug) ?? null;

                return (
                  <td
                    key={`${show.setlistfmId}-${song.songSlug}`}
                    className={
                      position === null
                        ? styles.notPlayed
                        : styles.played
                    }
                    title={
                      position === null
                        ? `${song.songName} was not played at show ${show.showIndex}`
                        : `${song.songName} was played at position ${position} in show ${show.showIndex}`
                    }
                  >
                    {position ?? ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function buildPositionLookup(
  analysis: TourAnalysis
): Map<string, Map<string, number>> {
  const lookup = new Map<string, Map<string, number>>();

  for (const show of analysis.shows) {
    const positions = new Map<string, number>();

    for (const song of show.songs) {
      if (!positions.has(song.songSlug)) {
        positions.set(song.songSlug, song.absolutePosition);
      }
    }

    lookup.set(show.setlistfmId, positions);
  }

  return lookup;
}