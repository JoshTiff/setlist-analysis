"use client";

import { FormEvent, useState } from "react";

import styles from "./ArtistSearch.module.css";

type ArtistSearchResult = {
  mbid: string;
  name: string;
  sortName: string | null;
  disambiguation: string | null;
  url: string | null;
};

type ArtistSearchApiResponse = {
  artists: ArtistSearchResult[];
  total: number;
  page: number;
  itemsPerPage: number;
  error?: string;
};

export function ArtistSearch() {
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState<ArtistSearchResult[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setError("Enter at least 2 characters to search.");
      setArtists([]);
      setTotal(null);
      return;
    }

    setLoading(true);
    setError("");
    setArtists([]);
    setTotal(null);

    try {
      const params = new URLSearchParams({
        q: trimmedQuery,
      });

      const response = await fetch(`/api/artists/search?${params.toString()}`);

      const data = (await response.json()) as ArtistSearchApiResponse;

      if (!response.ok) {
        throw new Error(data.error || "Artist search failed.");
      }

      setArtists(data.artists ?? []);
      setTotal(data.total ?? 0);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while searching artists.";

      setError(message);
      setArtists([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Setlist Analysis</p>
        <h1 className={styles.title}>Track how a tour changes over time.</h1>
        <p className={styles.description}>
          Search for an artist to start exploring setlist changes, song
          rotation, opener and closer patterns, encore trends, and tour
          stability.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="artist-search">
          Artist name
        </label>

        <div className={styles.searchRow}>
          <input
            id="artist-search"
            className={styles.input}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Noah Kahan, Radiohead, Nine Inch Nails..."
            autoComplete="off"
          />

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error ? <p className={styles.error}>{error}</p> : null}

      {total !== null && !error ? (
        <p className={styles.resultCount}>
          Found {total} result{total === 1 ? "" : "s"}.
        </p>
      ) : null}

      {artists.length > 0 ? (
        <ul className={styles.results}>
          {artists.map((artist) => (
            <li className={styles.resultCard} key={artist.mbid}>
              <div>
                <h2 className={styles.artistName}>{artist.name}</h2>

                {artist.disambiguation ? (
                  <p className={styles.artistMeta}>{artist.disambiguation}</p>
                ) : null}

                <p className={styles.artistMbid}>MBID: {artist.mbid}</p>
              </div>

              {artist.url ? (
                <a
                  className={styles.externalLink}
                  href={artist.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on setlist.fm
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {total === 0 && !loading && !error ? (
        <p className={styles.emptyState}>
          No artists found. Try a different spelling or a more specific name.
        </p>
      ) : null}
    </section>
  );
}