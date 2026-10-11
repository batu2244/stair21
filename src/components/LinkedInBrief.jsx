import { useEffect, useRef, useState } from "react";
import { linkedinBrief } from "@/lib/api";

const POLL_MS = 15000;
const MAX_POLLS = 12; // about three minutes

function updated(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
}

// LinkedIn insights: loads automatically when the client has a LinkedIn link,
// and "Refresh" asks for a fresh scrape. Long scrapes are polled until ready.
export default function LinkedInBrief({ url }) {
  const [brief, setBrief] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const polls = useRef(0);
  const timer = useRef(null);

  const load = async (force = false) => {
    clearTimeout(timer.current);
    setBusy(true);
    setError("");
    try {
      const b = await linkedinBrief(url, force);
      setBrief(b);
      if (b.status === "pending" && polls.current++ < MAX_POLLS) {
        timer.current = setTimeout(() => load(false), POLL_MS);
        return;
      }
      if (b.status === "pending") setError("LinkedIn is taking longer than usual. Try again in a few minutes.");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  useEffect(() => {
    polls.current = 0;
    load(false);
    return () => clearTimeout(timer.current);
  }, [url]);

  const ready = brief?.status === "ready";

  return (
    <section className="panel-card">
      <div className="card-head">
        <h2 className="card-title">From LinkedIn</h2>
        <div className="li-head-right">
          {ready && !busy && <span className="muted small">Updated {updated(brief.fetched_at)}</span>}
          <button className="btn btn-sm btn-secondary" disabled={busy} onClick={() => { polls.current = 0; load(true); }}>
            {busy ? "Reading LinkedIn…" : "Refresh from LinkedIn"}
          </button>
        </div>
      </div>
      <div className="pad">
        {busy && !ready ? (
          <p className="muted">Reading their LinkedIn profile and writing talking points. This can take up to a minute.</p>
        ) : error && !ready ? (
          <p className="error" style={{ marginTop: 0 }}>{error}</p>
        ) : brief?.status === "failed" ? (
          <p className="muted">{brief.error}</p>
        ) : ready ? (
          <>
            {brief.headline && <p className="cp-big">{brief.headline}</p>}
            <ul className="li-bullets">
              {brief.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>
            {error && <p className="error">{error}</p>}
          </>
        ) : null}
      </div>
    </section>
  );
}
