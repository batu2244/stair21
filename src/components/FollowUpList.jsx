import { navigate } from "@/lib/router";
import { relative, shortDay, timeOf } from "@/lib/dates";
import "@/components/FollowUpList.css";

const PRIORITY = {
  high: { label: "High", arrow: "▲", className: "fu-prio-high" },
  low: { label: "Low", arrow: "▼", className: "fu-prio-low" },
};

// Follow-up rows: when, who, internal note, priority, client confirmation.
// Example rows (h.example) open the follow-up manager.
export default function FollowUpList({ items, overdue = false }) {
  return (
    <div className="list">
      {items.map((h) => {
        const p = PRIORITY[h.priority];
        return (
          <button className={`fu-row${p ? " fu-row-prio" : ""}`} key={h.id}
            onClick={() => navigate(h.example ? "/follow-ups" : `/hubs/${h.id}`)}>
            {p && (
              <span className={`fu-prio ${p.className}`} aria-label={`${p.label} priority`}>
                <span className="fu-prio-label">{p.label}</span>
                <span className="fu-prio-arrow" aria-hidden="true">{p.arrow}</span>
              </span>
            )}
            <div className={`fu-when${overdue ? " danger" : ""}`}>
              <div className="fu-rel">{relative(h.next_meeting_at)}</div>
              <div className="muted small">{shortDay(h.next_meeting_at)} · {timeOf(h.next_meeting_at)}</div>
            </div>
            <div className="fu-main">
              <div className="strong">{h.client_name}</div>
              {(h.example || h.follow_up_note) && (
                <div className="muted small">{[h.example && "Example", h.follow_up_note].filter(Boolean).join(" · ")}</div>
              )}
            </div>
            <span className={`pill ${h.meeting_confirmed ? "pill-ok" : ""}`}>
              {h.meeting_confirmed ? "Confirmed" : h.live_version > 0 ? "Not confirmed" : "Not shared"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
