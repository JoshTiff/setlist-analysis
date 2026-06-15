import { notFound } from "next/navigation";

import { getCachedTourDashboardData } from "@/lib/supabase/readTourData";

import styles from "./TourDashboard.module.css";

type TourPageProps = {
  params: Promise<{
    artistSlug: string;
    tourSlug: string;
  }>;
};

export default async function TourPage({ params }: TourPageProps) {
  const { artistSlug, tourSlug } = await params;

  const dashboardData = await getCachedTourDashboardData(artistSlug, tourSlug);

  if (!dashboardData) {
    notFound();
  }

  const { artist, tour, refreshedAt, analysis } = dashboardData;

  const topSongs = analysis.songStats.slice(0, 12);
  const recentChanges = analysis.changes.slice(-5).reverse();
  const coreSongs = analysis.songStats.filter((song) => song.isCore);
  const rotatingSongs = analysis.songStats.filter((song) => song.isRotating);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Tour Dashboard</p>
        <h1 className={styles.title}>{artist.name}</h1>
        <p className={styles.subtitle}>{tour.name}</p>

        <div className={styles.metaRow}>
          <span>{analysis.shows.length} shows cached</span>
          <span>{analysis.songStats.length} songs tracked</span>
          <span>{coreSongs.length} core songs</span>
          <span>{rotatingSongs.length} rotating songs</span>
        </div>

        {refreshedAt ? (
          <p className={styles.refreshed}>
            Last refreshed: {formatDateTime(refreshedAt)}
          </p>
        ) : null}
      </section>

      <section className={styles.grid}>
        <article className={styles.scoreCard}>
          <p className={styles.cardLabel}>Tour Stability</p>
          <p className={styles.score}>{analysis.stability.score}</p>
          <p className={styles.scoreText}>
            {analysis.stability.interpretation}
          </p>
        </article>

        <article className={styles.card}>
          <p className={styles.cardLabel}>Average Song Overlap</p>
          <p className={styles.metric}>
            {formatPercent(analysis.stability.averageJaccardSimilarity)}
          </p>
        </article>

        <article className={styles.card}>
          <p className={styles.cardLabel}>Average Position Similarity</p>
          <p className={styles.metric}>
            {formatPercent(analysis.stability.averagePositionSimilarity)}
          </p>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Top Songs</h2>
          <p>Most frequently played songs on this cached tour.</p>
        </div>

        {topSongs.length > 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {topSongs.map((song) => (
                  <tr key={song.songSlug}>
                    <td>{song.songName}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.empty}>No songs cached for this tour yet.</p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recent Setlist Changes</h2>
          <p>Added, removed, and moved songs between adjacent shows.</p>
        </div>

        {recentChanges.length > 0 ? (
          <div className={styles.changeList}>
            {recentChanges.map((change) => (
              <article
                className={styles.changeCard}
                key={`${change.fromShowId}-${change.toShowId}`}
              >
                <h3>
                  Show {change.fromShowIndex} → Show {change.toShowIndex}
                </h3>

                <div className={styles.changeGrid}>
                  <div>
                    <h4>Added</h4>
                    {change.addedSongs.length > 0 ? (
                      <ul>
                        {change.addedSongs.map((song) => (
                          <li key={song.songSlug}>{song.songName}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>None</p>
                    )}
                  </div>

                  <div>
                    <h4>Removed</h4>
                    {change.removedSongs.length > 0 ? (
                      <ul>
                        {change.removedSongs.map((song) => (
                          <li key={song.songSlug}>{song.songName}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>None</p>
                    )}
                  </div>

                  <div>
                    <h4>Moved</h4>
                    {change.movedSongs.length > 0 ? (
                      <ul>
                        {change.movedSongs.slice(0, 5).map((song) => (
                          <li key={song.songSlug}>
                            {song.songName}: {song.fromPosition} →{" "}
                            {song.toPosition}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>None</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            Not enough cached shows to compare changes yet.
          </p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Cached Shows</h2>
          <p>Shows currently available for this tour.</p>
        </div>

        {analysis.shows.length > 0 ? (
          <ol className={styles.showList}>
            {analysis.shows.map((show) => (
              <li className={styles.showCard} key={show.setlistfmId}>
                <div>
                  <h3>
                    Show {show.showIndex}
                    {show.eventDate ? ` — ${formatDate(show.eventDate)}` : ""}
                  </h3>
                  <p>
                    {[show.venueName, show.cityName, show.stateName]
                      .filter(Boolean)
                      .join(", ") || "Location unavailable"}
                  </p>
                </div>

                {show.setlistfmUrl ? (
                  <a href={show.setlistfmUrl} target="_blank" rel="noreferrer">
                    View setlist
                  </a>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.empty}>
            No cached shows yet. Refresh this artist from the API first.
          </p>
        )}
      </section>
    </main>
  );
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}