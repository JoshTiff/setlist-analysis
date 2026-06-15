import type { TourAnalysis } from "@/lib/analysis";

import styles from "./SongPositionChart.module.css";

type SongPositionChartProps = {
  analysis: TourAnalysis;
  maxSongs?: number;
};

type ChartPoint = {
  x: number;
  y: number;
  showIndex: number;
  position: number;
};

type ChartSeries = {
  songSlug: string;
  songName: string;
  points: ChartPoint[];
};

const WIDTH = 900;
const HEIGHT = 420;
const LEFT = 70;
const RIGHT = 30;
const TOP = 30;
const BOTTOM = 70;

export function SongPositionChart({
  analysis,
  maxSongs = 6,
}: SongPositionChartProps) {
  const shows = analysis.shows;
  const selectedSongs = analysis.songStats
    .filter((song) => song.showCount >= 2)
    .slice(0, maxSongs);

  if (shows.length < 2 || selectedSongs.length === 0) {
    return (
      <p className={styles.empty}>
        Not enough repeated songs to chart position changes yet.
      </p>
    );
  }

  const maxPosition = Math.max(
    ...shows.flatMap((show) => show.songs.map((song) => song.absolutePosition)),
    1
  );

  const plotWidth = WIDTH - LEFT - RIGHT;
  const plotHeight = HEIGHT - TOP - BOTTOM;

  const series = selectedSongs.map((song): ChartSeries => {
    const points: ChartPoint[] = [];

    for (const show of shows) {
      const showSong = show.songs.find(
        (candidate) => candidate.songSlug === song.songSlug
      );

      if (!showSong) {
        continue;
      }

      const x =
        shows.length === 1
          ? LEFT + plotWidth / 2
          : LEFT + ((show.showIndex - 1) / (shows.length - 1)) * plotWidth;

      const y =
        TOP +
        ((showSong.absolutePosition - 1) / Math.max(maxPosition - 1, 1)) *
          plotHeight;

      points.push({
        x,
        y,
        showIndex: show.showIndex,
        position: showSong.absolutePosition,
      });
    }

    return {
      songSlug: song.songSlug,
      songName: song.songName,
      points,
    };
  });

  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Song position chart"
      >
        <line
          className={styles.axis}
          x1={LEFT}
          y1={TOP}
          x2={LEFT}
          y2={HEIGHT - BOTTOM}
        />
        <line
          className={styles.axis}
          x1={LEFT}
          y1={HEIGHT - BOTTOM}
          x2={WIDTH - RIGHT}
          y2={HEIGHT - BOTTOM}
        />

        <text className={styles.axisLabel} x={LEFT} y={20}>
          Position
        </text>

        <text
          className={styles.axisLabel}
          x={WIDTH / 2}
          y={HEIGHT - 25}
          textAnchor="middle"
        >
          Show Number
        </text>

        {[1, Math.ceil(maxPosition / 2), maxPosition].map((position) => {
          const y =
            TOP +
            ((position - 1) / Math.max(maxPosition - 1, 1)) * plotHeight;

          return (
            <g key={position}>
              <line
                className={styles.gridLine}
                x1={LEFT}
                y1={y}
                x2={WIDTH - RIGHT}
                y2={y}
              />
              <text
                className={styles.tickLabel}
                x={LEFT - 12}
                y={y + 4}
                textAnchor="end"
              >
                {position}
              </text>
            </g>
          );
        })}

        {shows.map((show) => {
          const x =
            shows.length === 1
              ? LEFT + plotWidth / 2
              : LEFT + ((show.showIndex - 1) / (shows.length - 1)) * plotWidth;

          return (
            <text
              className={styles.tickLabel}
              key={show.setlistfmId}
              x={x}
              y={HEIGHT - BOTTOM + 24}
              textAnchor="middle"
            >
              {show.showIndex}
            </text>
          );
        })}

        {series.map((song, index) => (
          <g
            className={`${styles.series} ${styles[`series${index % 6}`]}`}
            key={song.songSlug}
          >
            <polyline
              className={styles.line}
              points={song.points
                .map((point) => `${point.x},${point.y}`)
                .join(" ")}
            />

            {song.points.map((point) => (
              <circle
                className={styles.point}
                key={`${song.songSlug}-${point.showIndex}`}
                cx={point.x}
                cy={point.y}
                r="5"
              >
                <title>
                  {song.songName}, show {point.showIndex}, position{" "}
                  {point.position}
                </title>
              </circle>
            ))}
          </g>
        ))}
      </svg>

      <div className={styles.legend}>
        {series.map((song, index) => (
          <div
            className={`${styles.legendItem} ${styles[`series${index % 6}`]}`}
            key={song.songSlug}
          >
            <span />
            {song.songName}
          </div>
        ))}
      </div>
    </div>
  );
}