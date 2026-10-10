import { useEffect, useState } from "react";
import { hubs } from "@/lib/api";

// The advisor's hubs (summary rows). null while loading.
export function useHubs() {
  const [list, setList] = useState(null);
  useEffect(() => {
    hubs("listHubs").then((d) => setList(d.hubs)).catch(() => setList([]));
  }, []);
  return list;
}

// Scheduled follow-ups, soonest first, grouped. Earlier than today is overdue.
export function groupFollowUps(list) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekEnd = new Date(today.getTime() + 7 * 86400000);
  const scheduled = list.filter((h) => h.next_meeting_at).sort((a, b) => a.next_meeting_at.localeCompare(b.next_meeting_at));
  const at = (h) => new Date(h.next_meeting_at);
  return {
    overdue: scheduled.filter((h) => at(h) < today),
    week: scheduled.filter((h) => at(h) >= today && at(h) < weekEnd),
    later: scheduled.filter((h) => at(h) >= weekEnd),
    unscheduled: list.filter((h) => !h.next_meeting_at),
  };
}
