import { navigate } from "@/lib/router";
import { relative, shortDay, timeOf } from "@/lib/dates";
import "@/components/FollowUpList.css";

const PRIORITY = {
  high: { label: "High", className: "pill-priority-high" },
  low: { label: "Low", className: "pill-priority-low" },
};

// Follow-up rows: when, who, internal note, priority, client confirmation.
// Example rows (h.example) open the built-in example hub.
export default function FollowUpList({ items, overdue = false }) {
  return (
    <div className="list">
      {items.map((h) => {
        const p = PRIORITY[h.priority];
        return (
          <button className="fu-row" key={h.id} onClick={() => navigate(h.example ? "/c/example" : `/hubs/${h.id}`)}>
            <div className={`fu-when${overdue ? " danger" : ""}`}>
              <div className="fu-rel">{relative(h.next_meeting_at)}</div>
              <div className="muted small">{shortDay(h.next_meeting_at)} · {timeOf(h.next_meeting_at)}</div>
            </div>
            <div className="fu-main">
              <div className="strong">{h.example ? `Example · ${h.client_name}` : h.client_name}</div>
              {h.follow_up_note && <div className="muted small">{h.follow_up_note}</div>}
            </div>
            {p && <span className={`pill ${p.className}`}>{p.label}</span>}
            <span className={`pill ${h.meeting_confirmed ? "pill-ok" : ""}`}>
              {h.meeting_confirmed ? "Confirmed" : h.live_version > 0 ? "Not confirmed" : "Not shared"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
