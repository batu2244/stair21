import { navigate } from "@/lib/router";
import { relative, shortDay, timeOf } from "@/lib/dates";

// Follow-up rows: when, who, internal note, client confirmation.
export default function FollowUpList({ items, overdue = false }) {
  return (
    <div className="list">
      {items.map((h) => (
        <button className="fu-row" key={h.id} onClick={() => navigate(`/hubs/${h.id}`)}>
          <div className={`fu-when${overdue ? " danger" : ""}`}>
            <div className="fu-rel">{relative(h.next_meeting_at)}</div>
            <div className="muted small">{shortDay(h.next_meeting_at)} · {timeOf(h.next_meeting_at)}</div>
          </div>
          <div className="fu-main">
            <div className="strong">{h.client_name}</div>
            {h.follow_up_note && <div className="muted small">{h.follow_up_note}</div>}
          </div>
          <span className={`pill ${h.meeting_confirmed ? "pill-ok" : ""}`}>
            {h.meeting_confirmed ? "Confirmed" : h.live_version > 0 ? "Not confirmed" : "Not shared"}
          </span>
        </button>
      ))}
    </div>
  );
}
