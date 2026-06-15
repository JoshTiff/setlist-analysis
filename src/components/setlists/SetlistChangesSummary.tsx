import type { SetlistChange } from "@/lib/analysis";

import styles from "./SetlistChangesSummary.module.css";

type SetlistChangesSummaryProps = {
  changes: SetlistChange[];
  limit?: number;
};

export function SetlistChangesSummary({
  changes,
  limit = 6,
}: SetlistChangesSummaryProps) {
  const recentChanges = changes.slice(-limit).reverse();

  if (recentChanges.length === 0) {
    return (
      <p className={styles.empty}>
        Not enough cached shows to compare changes yet.
      </p>
    );
  }

  return (
    <div className={styles.changeList}>
      {recentChanges.map((change) => (
        <article
          className={styles.changeCard}
          key={`${change.fromShowId}-${change.toShowId}`}
        >
          <div className={styles.cardHeader}>
            <h3>
              Show {change.fromShowIndex} → Show {change.toShowIndex}
            </h3>

            <p>
              {change.addedSongs.length} added · {change.removedSongs.length}{" "}
              removed · {change.movedSongs.length} moved
            </p>
          </div>

          <div className={styles.changeGrid}>
            <ChangeColumn
              title="Added"
              emptyLabel="No additions"
              items={change.addedSongs.map((song) => song.songName)}
            />

            <ChangeColumn
              title="Removed"
              emptyLabel="No removals"
              items={change.removedSongs.map((song) => song.songName)}
            />

            <ChangeColumn
              title="Biggest Moves"
              emptyLabel="No movement"
              items={change.movedSongs.slice(0, 6).map(
                (song) =>
                  `${song.songName}: ${song.fromPosition} → ${song.toPosition}`
              )}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

type ChangeColumnProps = {
  title: string;
  emptyLabel: string;
  items: string[];
};

function ChangeColumn({ title, emptyLabel, items }: ChangeColumnProps) {
  return (
    <div>
      <h4>{title}</h4>

      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>{emptyLabel}</p>
      )}
    </div>
  );
}