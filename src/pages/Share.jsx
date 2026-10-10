import { useEffect, useState } from "react";
import { hubs } from "@/lib/api";
import { navigate, linkUrl } from "@/lib/router";
import "./Share.css";

// Share: send each client their approved hub. The app creates an expiring link
// and drafts a personal message; the advisor sends it from their own email or phone.

function formatDay(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric" }) : "";
}

function draftMessage({ firstName, advisorName, url, expires }) {
  return [
    `Hi ${firstName},`,
    "",
    "Thanks for meeting with me. I put together a short page for you that recaps what we talked about and your next steps:",
    "",
    url,
    "",
    `The link is just for you and works until ${formatDay(expires)}.`,
    "",
    "Best,",
    advisorName,
  ].join("\n");
}

function Compose({ h, me, notify }) {
  const [link, setLink] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const firstName = h.client_name.split(" ")[0];
  const subject = `Your plan summary, ${firstName}`;

  const create = async () => {
    setBusy(true);
    try {
      const r = await hubs("createLink", { hubId: h.id });
      const url = linkUrl(r.token);
      setLink({ url, expires: r.expires_at });
      setText(draftMessage({ firstName, advisorName: me.profile?.name || "", url, expires: r.expires_at }));
    } catch (err) {
      notify(err.message);
    } finally {
      setBusy(false);
    }
  };

  const copy = async (value, msg) => {
    try {
      await navigator.clipboard.writeText(value);
      notify(msg);
    } catch {
      notify("Couldn't copy. Select the text and copy it instead.");
    }
  };

  if (!link) {
    return (
      <div className="share-compose">
        <div className="share-actions">
          <button className="btn btn-sm" disabled={busy} onClick={create}>
            {busy ? "Creating link…" : "Create link and message"}
          </button>
          <span className="muted small">Makes a new private link that expires.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="share-compose">
      <label>
        <span className="label" style={{ display: "block", marginBottom: 6 }}>Message</span>
        <textarea className="input" value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <div className="share-actions">
        <a className="btn btn-sm" href={`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`}>
          Open in email
        </a>
        <a className="btn btn-sm btn-secondary" href={`sms:?&body=${encodeURIComponent(text)}`}>Open in Messages</a>
        <button className="btn btn-sm btn-secondary" onClick={() => copy(text, "Message copied")}>Copy message</button>
        <button className="link small" onClick={() => copy(link.url, "Link copied")}>Copy link only</button>
      </div>
      <div className="share-link">{link.url} · expires {formatDay(link.expires)}</div>
    </div>
  );
}

export default function Share({ me, notify }) {
  const [list, setList] = useState(null);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    hubs("listHubs").then((d) => setList(d.hubs)).catch(() => setList([]));
  }, []);

  const all = (list || []).slice().sort((a, b) => a.client_name.localeCompare(b.client_name));
  const ready = all.filter((h) => h.live_version > 0);
  const notReady = all.filter((h) => !h.live_version);

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Share</div>
          <h1 className="page-title">Send clients their page</h1>
          <p className="muted" style={{ marginTop: 6 }}>Each client gets a private link to their approved page, with a short note from you.</p>
        </div>
      </div>

      {list === null ? <p className="muted">Loading…</p> : (
        <>
          <section className="panel-card share-section">
            <div className="card-head">
              <h2 className="card-title">Ready to send</h2>
              <span className="muted small">{ready.length}</span>
            </div>
            {ready.length === 0 ? (
              <div className="pad">
                <p className="muted" style={{ marginBottom: 14 }}>No approved client pages yet.</p>
                <ol className="share-steps">
                  <li>Add a client with your meeting notes.</li>
                  <li>Review the AI draft and get compliance sign-off.</li>
                  <li>Come back here to send it.</li>
                </ol>
              </div>
            ) : (
              <div className="share-list">
                {ready.map((h) => (
                  <div className="share-row" key={h.id}>
                    <div className="share-row-head">
                      <div>
                        <div className="strong">{h.client_name}</div>
                        <div className="muted small">
                          Version {h.live_version} approved
                          {h.status === "draft" ? " · a newer draft is waiting for sign-off" : ""}
                        </div>
                      </div>
                      <button className="link small" onClick={() => setOpen(open === h.id ? null : h.id)}>
                        {open === h.id ? "Close" : "Send"}
                      </button>
                    </div>
                    {open === h.id && <Compose h={h} me={me} notify={notify} />}
                  </div>
                ))}
              </div>
            )}
          </section>

          {notReady.length > 0 && (
            <section className="panel-card share-section">
              <div className="card-head">
                <h2 className="card-title">Needs sign-off first</h2>
                <span className="muted small">{notReady.length}</span>
              </div>
              <div className="share-list">
                {notReady.map((h) => (
                  <div className="share-row" key={h.id}>
                    <div className="share-row-head">
                      <div className="strong">{h.client_name}</div>
                      <button className="link small" onClick={() => navigate(`/hubs/${h.id}`)}>Review and approve ›</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
