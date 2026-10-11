import { useEffect, useRef, useState } from "react";
import { linkedinBrief } from "@/lib/api";
import { isLinkedInProfile } from "@/lib/linkedinLinks";
import "@/components/LinkedInBrief.css";

const POLL_MS = 15000;
const MAX_POLLS = 12; // about three minutes

function updated(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
}

// Ask for (or change) the client's LinkedIn link. onSave may throw to show an error.
function LinkForm({ initial = "", onSave, onCancel }) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!isLinkedInProfile(value)) return setError("Paste a LinkedIn profile link, like linkedin.com/in/their-name");
    setSaving(true);
    setError("");
    try {
      await onSave(value.trim());
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="li-form">
        <input className="input" value={value} onChange={(e) => setValue(e.target.value)}
          placeholder="linkedin.com/in/their-name" aria-label="LinkedIn profile link" autoFocus={!!initial} />
        <button className="btn" type="submit" disabled={saving || !value.trim()}>{saving ? "Saving…" : "Get insights"}</button>
        {onCancel && <button className="link small" type="button" onClick={onCancel}>Cancel</button>}
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

// LinkedIn insights. Opening a profile only shows talking points generated
// earlier; nothing is scraped until the advisor clicks Generate (or Refresh for
// a fresh scrape). Long scrapes are polled until ready. Without a link, it asks
// for one first.
export default function LinkedInBrief({ url, onSaveUrl }) {
  const [brief, setBrief] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const polls = useRef(0);
  const timer = useRef(null);

  // mode: "cached" (show earlier result only), "generate", or "refresh" (force a new scrape).
  const load = async (mode = "generate") => {
    clearTimeout(timer.current);
    setBusy(mode !== "cached");
    setError("");
    try {
      const b = await linkedinBrief(url, { cached: mode === "cached", force: mode === "refresh" });
      setBrief(b);
      if (b.status === "pending" && polls.current++ < MAX_POLLS) {
        setBusy(true);
        timer.current = setTimeout(() => load("generate"), POLL_MS);
        return;
      }
      if (b.status === "pending") setError("LinkedIn is taking longer than usual. Try again in a few minutes.");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  useEffect(() => {
    setBrief(null);
    setError("");
    polls.current = 0;
    if (url) load("cached");
    return () => clearTimeout(timer.current);
  }, [url]);

  const save = async (value) => {
    await onSaveUrl(value);
    setEditing(false);
  };

  const ready = brief?.status === "ready";
  const generate = (mode) => { polls.current = 0; load(mode); };
  const showForm = !url || editing;

  return (
    <section className="panel-card">
      <div className="card-head">
        <h2 className="card-title">From LinkedIn</h2>
        {url && !editing && (
          <div className="li-head-right">
            {ready && !busy && <span className="muted small">Updated {updated(brief.fetched_at)}</span>}
            {(ready || brief?.status === "failed") && (
              <button className="btn btn-sm btn-secondary" disabled={busy} onClick={() => generate("refresh")}>
                {busy ? "Reading LinkedIn…" : "Refresh from LinkedIn"}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="pad">
        {showForm ? (
          <>
            {!url && <p className="muted li-intro">Add their LinkedIn link, then generate talking points from their profile.</p>}
            <LinkForm initial={editing ? url : ""} onSave={save} onCancel={editing ? () => setEditing(false) : null} />
          </>
        ) : (
          <>
            {busy && !ready ? (
              <p className="muted">Reading their LinkedIn profile and writing talking points. This can take up to a minute.</p>
            ) : error && !ready && brief?.status !== "none" ? (
              <p className="error" style={{ marginTop: 0 }}>{error}</p>
            ) : brief?.status === "failed" ? (
              <p className="muted">{brief.error}</p>
            ) : brief?.status === "none" ? (
              <div className="li-empty">
                <p className="muted">No talking points yet. Generate them from their LinkedIn profile when you're ready.</p>
                <button className="btn" disabled={busy} onClick={() => generate("generate")}>Generate from LinkedIn</button>
                {error && <p className="error">{error}</p>}
              </div>
            ) : ready ? (
              <>
                {brief.headline && <p className="li-headline">{brief.headline}</p>}
                <ul className="li-bullets">
                  {brief.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
                {error && <p className="error">{error}</p>}
              </>
            ) : null}
            {onSaveUrl && (
              <div className="li-foot">
                <a className="link small" href={url} target="_blank" rel="noreferrer">View on LinkedIn</a>
                <button className="link small" type="button" onClick={() => setEditing(true)}>Change link</button>
                <a className="muted small li-credit" href="https://brightdata.com" target="_blank" rel="noreferrer">Data from Bright Data</a>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
