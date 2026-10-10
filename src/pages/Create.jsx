import { useState } from "react";
import { navigate } from "@/lib/router";
import { hubs } from "@/lib/api";
import BackLink from "@/components/BackLink";
import { fromLocalInput } from "@/lib/dates";

// Add Client: just a name and your notes. AI drafts the rest (goals, plan,
// next steps); you review it on the next screen.
export default function Create() {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [nextMeeting, setNextMeeting] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ready = name.trim() && notes.trim();

  const submit = async (e) => {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    try {
      const { hub } = await hubs("createHub", {
        client_name: name.trim(),
        meeting_notes: notes.trim(),
        next_meeting_at: fromLocalInput(nextMeeting),
      });
      navigate(`/hubs/${hub.id}`);
    } catch (err) {
      setError(err.message === "Something went wrong" ? "Something went wrong. Please try again." : err.message);
      setBusy(false);
    }
  };

  return (
    <main className="screen">
      <div className="topbar">
        <BackLink to="/" label="Dashboard" />
      </div>

      <h1 className="headline">Add a client</h1>

      <form onSubmit={submit} style={{ marginTop: 32 }}>
        <label className="field">
          <span className="label">Name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Maria Lopez" autoFocus />
        </label>
        <label className="field">
          <span className="label">Notes</span>
          <textarea className="input" rows={6} value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="What you talked about and what happens next." />
        </label>
        <label className="field">
          <span className="label">Next meeting <span className="muted" style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></span>
          <input className="input" type="datetime-local" value={nextMeeting} onChange={(e) => setNextMeeting(e.target.value)} />
        </label>

        <button className="btn btn-block" type="submit" disabled={!ready || busy} style={{ marginTop: 8 }}>
          {busy ? "Creating…" : "Add client"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}
