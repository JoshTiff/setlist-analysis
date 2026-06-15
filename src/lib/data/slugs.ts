export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeSongName(value: string): string {
  return normalizeText(value).toLowerCase();
}

export function toSlug(value: string, fallback = "unknown"): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}