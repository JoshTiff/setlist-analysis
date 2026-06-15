import type { SongStats } from "@/lib/analysis";

import styles from "./SongStatsTable.module.css";

type SongStatsTableProps = {
  songStats: SongStats[];
  limit?: number;
};

export function SongStatsTable({ songStats, limit = 20 }: SongStatsTableProps) {
  const visibleSongs = songStats.slice(0, limit);

  if (visibleSongs.length === 0) {
    return (
      <p className={styles.empty}>No songs cached for this tour yet.</p>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Song</th>
            <th>Shows</th>
            <th>Frequency</th>
            <th>Avg. Position</th>
            <th>Openers</th>
            <th>Closers</th>
            <th>Encores</th>
            <th>Type</th>
          </tr>
        </thead>

        <tbody>
          {visibleSongs.map((song) => (
            <tr key={song.songSlug}>
              <td>
                <strong>{song.songName}</strong>
              </td>
              <td>
                {song.showCount}/{song.totalShows}
              </td>
              <td>{formatPercent(song.frequency)}</td>
              <td>
                {song.averagePosition === null
                  ? "—"
                  : song.averagePosition.toFixed(1)}
              </td>
              <td>{song.openerCount}</td>
              <td>{song.closerCount}</td>
              <td>{song.encoreCount}</td>
              <td>
                {song.isCore ? (
                  <span className={styles.badge}>Core</span>
                ) : song.isRotating ? (
                  <span className={styles.badgeSecondary}>Rotating</span>
                ) : (
                  <span className={styles.muted}>Regular</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}