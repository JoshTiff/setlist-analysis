import type {
  AnalysisShowSong,
  MovedSong,
  PreparedShow,
  SetlistChange,
  SongChangeItem,
} from "./types";

export function getSetlistChanges(shows: PreparedShow[]): SetlistChange[] {
  const changes: SetlistChange[] = [];

  for (let index = 1; index < shows.length; index++) {
    changes.push(compareAdjacentShows(shows[index - 1], shows[index]));
  }

  return changes;
}

export function compareAdjacentShows(
  fromShow: PreparedShow,
  toShow: PreparedShow
): SetlistChange {
  const fromSongsBySlug = getFirstSongBySlug(fromShow.songs);
  const toSongsBySlug = getFirstSongBySlug(toShow.songs);

  const fromSlugs = new Set(fromSongsBySlug.keys());
  const toSlugs = new Set(toSongsBySlug.keys());

  const addedSongs: SongChangeItem[] = [];
  const removedSongs: SongChangeItem[] = [];
  const movedSongs: MovedSong[] = [];

  for (const songSlug of toSlugs) {
    if (!fromSlugs.has(songSlug)) {
      const song = toSongsBySlug.get(songSlug);

      if (song) {
        addedSongs.push({
          songName: song.songName,
          songSlug: song.songSlug,
          position: song.absolutePosition,
        });
      }
    }
  }

  for (const songSlug of fromSlugs) {
    if (!toSlugs.has(songSlug)) {
      const song = fromSongsBySlug.get(songSlug);

      if (song) {
        removedSongs.push({
          songName: song.songName,
          songSlug: song.songSlug,
          position: song.absolutePosition,
        });
      }
    }
  }

  for (const songSlug of toSlugs) {
    if (!fromSlugs.has(songSlug)) {
      continue;
    }

    const fromSong = fromSongsBySlug.get(songSlug);
    const toSong = toSongsBySlug.get(songSlug);

    if (!fromSong || !toSong) {
      continue;
    }

    const positionChange = toSong.absolutePosition - fromSong.absolutePosition;

    if (positionChange !== 0) {
      movedSongs.push({
        songName: toSong.songName,
        songSlug: toSong.songSlug,
        fromPosition: fromSong.absolutePosition,
        toPosition: toSong.absolutePosition,
        positionChange,
        fromSetName: fromSong.setName,
        toSetName: toSong.setName,
      });
    }
  }

  return {
    fromShowId: fromShow.setlistfmId,
    toShowId: toShow.setlistfmId,
    fromShowIndex: fromShow.showIndex,
    toShowIndex: toShow.showIndex,
    addedSongs: addedSongs.sort(sortSongChangeItems),
    removedSongs: removedSongs.sort(sortSongChangeItems),
    movedSongs: movedSongs.sort(
      (a, b) => Math.abs(b.positionChange) - Math.abs(a.positionChange)
    ),
  };
}

function getFirstSongBySlug(
  songs: AnalysisShowSong[]
): Map<string, AnalysisShowSong> {
  const songsBySlug = new Map<string, AnalysisShowSong>();

  for (const song of songs) {
    if (!songsBySlug.has(song.songSlug)) {
      songsBySlug.set(song.songSlug, song);
    }
  }

  return songsBySlug;
}

function sortSongChangeItems(a: SongChangeItem, b: SongChangeItem): number {
  if (a.position === null && b.position === null) {
    return a.songName.localeCompare(b.songName);
  }

  if (a.position === null) {
    return 1;
  }

  if (b.position === null) {
    return -1;
  }

  return a.position - b.position;
}