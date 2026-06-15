import { notFound } from "next/navigation";

import { SongHeatmap } from "@/components/charts/SongHeatmap";
import { SongPositionChart } from "@/components/charts/SongPositionChart";
import { SetlistChangesSummary } from "@/components/setlists/SetlistChangesSummary";
import { SongStatsTable } from "@/components/setlists/SongStatsTable";
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
          <h2>Song Heatmap</h2>
          <p>
            Shows are columns. Songs are rows. Filled cells show where a song
            appeared in the setlist.
          </p>
        </div>

        <SongHeatmap analysis={analysis} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Song Position Chart</h2>
          <p>
            Tracks how frequently played songs move through the setlist across
            shows.
          </p>
        </div>

        <SongPositionChart analysis={analysis} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Song Stats</h2>
          <p>Most frequently played songs on this cached tour.</p>
        </div>

        <SongStatsTable songStats={analysis.songStats} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Setlist Changes</h2>
          <p>Added, removed, and moved songs between adjacent shows.</p>
        </div>

        <SetlistChangesSummary changes={analysis.changes} />
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