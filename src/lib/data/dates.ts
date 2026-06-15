export function parseSetlistFmEventDate(eventDate: string): string | null {
  const parts = eventDate.split("-");

  if (parts.length !== 3) {
    return null;
  }

  const [dayRaw, monthRaw, yearRaw] = parts;

  const day = Number(dayRaw);
  const month = Number(monthRaw);
  const year = Number(yearRaw);

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    year < 1000
  ) {
    return null;
  }

  const yyyy = String(year).padStart(4, "0");
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}