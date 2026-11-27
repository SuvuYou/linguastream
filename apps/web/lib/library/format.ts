export function thumbnailUrl(youtubeVideoId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(youtubeVideoId)}/mqdefault.jpg`;
}

const TINTS = ["var(--primary)", "var(--known)", "var(--learning)", "var(--unknown)"];

export function coverTint(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return TINTS[Math.abs(hash) % TINTS.length]!;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function addedLabel(addedAt: string, now = new Date()): string {
  const added = new Date(addedAt);
  const days = Math.round((startOfDay(now) - startOfDay(added)) / DAY_MS);
  if (days <= 0) return "added today";
  if (days < 7) return `added ${relative.format(-days, "day")}`;
  if (days < 30) return `added ${relative.format(-Math.floor(days / 7), "week")}`;
  if (added.getFullYear() === now.getFullYear())
    return `added ${added.toLocaleDateString("en", { day: "numeric", month: "short" })}`;
  return `added ${added.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}`;
}
