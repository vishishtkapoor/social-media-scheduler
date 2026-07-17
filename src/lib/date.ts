/** Date/time helpers. All "value" inputs accept an ISO string or a Date. */

export function toDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}

const pad = (n: number): string => String(n).padStart(2, "0");

export function formatDate(value: string | Date): string {
  return toDate(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(value: string | Date): string {
  return toDate(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateTime(value: string | Date): string {
  const d = toDate(value);
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · ${formatTime(d)}`;
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  const da = toDate(a);
  const db = toDate(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function isToday(value: string | Date): boolean {
  return isSameDay(value, new Date());
}

export function isTomorrow(value: string | Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(value, tomorrow);
}

export function isYesterday(value: string | Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(value, yesterday);
}

/** Short human label for a day: Today / Tomorrow / Yesterday / "Mon, Aug 17". */
export function dayLabel(value: string | Date): string {
  const d = toDate(value);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isYesterday(d)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function isPast(value: string | Date, now: Date = new Date()): boolean {
  return toDate(value).getTime() < now.getTime();
}

/** "just now", "4m ago", "3h ago", "6d ago", "2mo ago", "1y ago". */
export function timeAgo(value: string | Date, now: Date = new Date()): string {
  const diff = now.getTime() - toDate(value).getTime();
  if (diff < 60_000) return "just now";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/** yyyy-mm-dd in local time, for <input type="date"> values. */
export function toDateInputValue(value: string | Date): string {
  const d = toDate(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** hh:mm in local time, for <input type="time"> values. */
export function toTimeInputValue(value: string | Date): string {
  const d = toDate(value);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Build a local-time ISO timestamp from separate date/time input strings. */
export function combineDateTime(dateValue: string, timeValue: string): string {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0).toISOString();
}

/** Compact duration: "3d 4h", "4h 30m", "45m". */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60_000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
