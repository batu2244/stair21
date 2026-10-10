import { useState } from "react";
import { hubs } from "@/lib/api";
import { fromLocalInput, toLocalInput, relative, meetingDate } from "@/lib/dates";

// Set or move a hub's next meeting. Works in any status; the client sees the new date at once.
export default function FollowUpEditor({ hub, onSaved, notify }) {
  const [when, setWhen] = useState(toLocalInput(hub.next_meeting_at));
  const [note, setNote] = useState(hub.follow_up_note || "");
  const [busy, setBusy] = useState(false);
  const dirty = fromLocalInput(when) !== (hub.next_meeting_at || "") || note.trim() !== (hub.follow_up_note || "");

  const save = async (clear = false) => {
    setBusy(true);
    try {
      await hubs("setFollowUp", {
        hubId: hub.id,
        next_meeting_at: clear ? "" : fromLocalInput(when),
        follow_up_note: clear ? "" : note.trim(),
      });
      if (clear) { setWhen(""); setNote(""); }
      notify(clear ? "Follow-up cleared" : "Follow-up saved");
      onSaved();
    } catch (err) {
      notify(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="followup-card">
      <div className="dash-section-head" style={{ marginBottom: 0 }}>
        <div className="label">Follow-up</div>
        {hub.next_meeting_at && (
          <span className="muted small">
            {relative(hub.next_meeting_at)} · {meetingDate(hub.next_meeting_at)}
            {hub.meeting_confirmed ? " · Confirmed by client" : ""}
          </span>
        )}
      </div>
      <div className="followup-grid">
        <input className="input" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} aria-label="Next meeting" />
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note (not shown to client)" maxLength={300} />
      </div>
      <div className="actions" style={{ marginTop: 14 }}>
        <button className="btn btn-sm" disabled={busy || !dirty || !when} onClick={() => save()}>Save follow-up</button>
        {hub.next_meeting_at && <button className="link small" disabled={busy} onClick={() => save(true)}>Clear</button>}
      </div>
    </div>
  );
}
