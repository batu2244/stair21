import { useState } from "react";
import { navigate } from "@/lib/router";
import { hubs } from "@/lib/api";
import BackLink from "@/components/BackLink";
import { fromLocalInput } from "@/lib/dates";

export default function Create() {
  const [form, setForm] = useState({ client_name: "", goals_input: "", meeting_notes: "", next_step: "" });
  const [nextMeeting, setNextMeeting] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const ready = Object.values(form).every((v) => v.trim());

  const submit = async (e) => {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    try {
      const { hub } = await hubs("createHub", { ...form, next_meeting_at: fromLocalInput(nextMeeting) });
      navigate(`/hubs/${hub.id}`);
    } catch (err) {
      setError(err.message === "Something went wrong" ? "Something went wrong writing the hub. Please try again." : err.message);
      setBusy(false);
    }
  };

  return (
    <main className="screen">
      <div className="topbar">
        <BackLink to="/hubs" label="Client hubs" />
      </div>

      <h1 className="headline">New client hub</h1>
      <p className="subhead">From today's meeting. AI writes the draft; you and compliance review it.</p>

      <form onSubmit={submit} style={{ marginTop: 48 }}>
        <label className="field">
          <span className="label">Client name</span>
          <input className="input" value={form.client_name} onChange={set("client_name")} placeholder="Maria Lopez" autoFocus />
        </label>
        <label className="field">
          <span className="label">Goals</span>
          <textarea className="input" rows={3} value={form.goals_input} onChange={set("goals_input")}
            placeholder={"Retire by 62\nHelp pay for college"} />
          <p className="hint">One per line.</p>
        </label>
        <label className="field">
          <span className="label">Meeting notes</span>
          <textarea className="input" rows={6} value={form.meeting_notes} onChange={set("meeting_notes")}
            placeholder="What you discussed and the plan you agreed on." />
          <p className="hint">Leave out account numbers and balances. They won't appear on the hub.</p>
        </label>
        <label className="field">
          <span className="label">What happens next</span>
          <textarea className="input" rows={2} value={form.next_step} onChange={set("next_step")}
            placeholder="We'll email the rollover forms by Friday." />
          <p className="hint">One sentence.</p>
        </label>
        <label className="field">
          <span className="label">Next meeting (optional)</span>
          <input className="input" type="datetime-local" value={nextMeeting} onChange={(e) => setNextMeeting(e.target.value)} />
        </label>

        <button className="btn btn-block" type="submit" disabled={!ready || busy} style={{ marginTop: 16 }}>
          {busy ? "Writing the draft…" : "Create draft"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}
