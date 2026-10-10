const DAY_MS = 86_400_000;

const toTime = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const toIso = (time: number) => new Date(time).toISOString().slice(0, 10);
const weekdayOf = (iso: string) => new Date(toTime(iso)).getUTCDay();

export function localToday(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function addDays(iso: string, days: number): string {
  return toIso(toTime(iso) + days * DAY_MS);
}

// The next given weekday strictly after `iso` (0 = Sunday).
export function nextWeekday(iso: string, weekday: number): string {
  const diff = (weekday - weekdayOf(iso) + 7) % 7;
  return addDays(iso, diff === 0 ? 7 : diff);
}

export function addBusinessDays(iso: string, n: number): string {
  let date = iso;
  for (let left = n; left > 0; ) {
    date = addDays(date, 1);
    const day = weekdayOf(date);
    if (day !== 0 && day !== 6) left--;
  }
  return date;
}
