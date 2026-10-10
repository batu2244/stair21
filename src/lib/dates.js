// Date helpers for follow-ups. Dates are stored as ISO strings and shown in the
// viewer's own time zone.

export function meetingDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function shortDay(iso) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function timeOf(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// "Today", "Tomorrow", "In 5 days", "3 days ago"
export function relative(iso) {
  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(new Date(iso)) - startOf(new Date())) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return days > 0 ? `In ${days} days` : `${-days} days ago`;
}

// Value for <input type="datetime-local"> in local time.
export function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value) {
  return value ? new Date(value).toISOString() : "";
}
