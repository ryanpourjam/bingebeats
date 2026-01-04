import type { Show } from "./types";

export function mapShow(data: { shows: Show[] }): Show[] {
  return data.shows.map((s: Show) => ({
    id: s.id,
    name: s.name,
    imageUrl: s.imageUrl
      ? `https://image.tmdb.org/t/p/w500${s.imageUrl}`
      : null,
    description: s.description,
    homepage: s.homepage,
  }));
}
