import { useCallback, useEffect, useRef, useState } from "react";
import { hubs, STATUS } from "@/lib/api";
import { navigate, linkUrl } from "@/lib/router";
import HubView from "@/components/HubView";
import BackLink from "@/components/BackLink";
import FollowUpEditor from "@/components/FollowUpEditor";

function formatDate(iso, time = false) {
  if (!iso) return "";
  const opts = { month: "short", day: "numeric", year: "numeric" };
  if (time) Object.assign(opts, { hour: "numeric", minute: "2-digit" });
  return new Date(iso).toLocaleString(undefined, opts);
}

function linkState(l) {
  if (l.revoked) return "Revoked";
  if (new Date(l.expires_at) < new Date()) return "Expired";
  return "Active";
}

export default function HubDetail({ id, me, notify }) {
  const [data, setData] = useState(null);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reviewer, setReviewer] = useState("");
  const [attested, setAttested] = useState(false);
  const [newLink, setNewLink] = useState(null);
  const saving = useRef(Promise.resolve());

  const load = useCallback(
    () => hubs("getHub", { hubId: id }).then(setData).catch(() => setMissing(true)),
    [id]
  );
  useEffect(() => { load(); }, [load]);

  if (missing) {
    return <main className="screen"><div className="topbar"><BackLink to="/hubs" label="Client hubs" /></div><p className="muted">Hub not found.</p></main>;
  }
  if (!data) return <div className="spinner" />;

  const { hub, versions, links, activity } = data;
  const editable = hub.status === "draft";

  // Firm and advisor details come from the current settings until approval freezes them.
  const preview = {
    ...hub,
    advisor_title: me.profile?.title,
    advisor_photo_url: me.profile?.photo_url,
    firm_name: me.firm?.name,
    firm_logo_url: me.firm?.logo_url,
    disclosure: me.firm?.disclosure,
    version: 0,
  };

  const change = (patch) => {
    setData((d) => ({ ...d, hub: { ...d.hub, ...patch } }));
    saving.current = saving.current
      .then(() => hubs("updateHub", { hubId: id, patch }))
      .then((r) => r && setData((d) => ({ ...d, hub: { ...d.hub, compliance_flags: r.compliance_flags } })))
      .catch(() => notify("Couldn't save that edit"));
  };

  const run = async (action, params = {}, done) => {
    document.activeElement?.blur();
    setBusy(true);
    try {
      await saving.current;
      const r = await hubs(action, { hubId: id, ...params });
      if (done) await done(r);
      await load();
    } catch (err) {
      notify(err.message);
    } finally {
      setBusy(false);
    }
  };

  const createLink = () =>
    run("createLink", {}, async (r) => {
      const url = linkUrl(r.token);
      setNewLink({ url, expires_at: r.expires_at });
      try {
        await navigator.clipboard.writeText(url);
        notify("Link copied");
      } catch {
        /* the link is shown on screen */
      }
    });

  // ---- The one primary action for the current state ----
  let panel;
  if (editable) {
    panel = (
      <>
        <p className="muted small">
          Tap any text below to edit.{" "}
          {hub.live_version > 0 ? `Version ${hub.live_version} stays live until this one is approved.` : "Your client sees nothing until it's approved."}
        </p>
        <label className="field" style={{ marginTop: 24 }}>
          <span className="label">Portal link</span>
          <input className="input" defaultValue={hub.portal_url} placeholder="https://portal.yourcustodian.com"
            onBlur={(e) => e.target.value.trim() !== (hub.portal_url || "") && change({ portal_url: e.target.value.trim() })} />
          <p className="hint">Where the client sees balances and account details.</p>
        </label>

        <div className="signoff">
          <div className="label">Compliance sign-off</div>
          <input className="input" value={reviewer} onChange={(e) => setReviewer(e.target.value)} placeholder="Reviewer's name" />
          <label className="check-row">
            <input type="checkbox" checked={attested} onChange={(e) => setAttested(e.target.checked)} />
            <span>I reviewed this hub against firm policy: no performance claims, testimonials, recommendations or account details.</span>
          </label>
          <button className="btn" disabled={busy || !reviewer.trim() || !attested}
            onClick={() => run("approveHub", { reviewer: reviewer.trim(), attested }, () => { setAttested(false); })}>
            Approve and publish
          </button>
          <p className="hint">Approval archives this version permanently.</p>
        </div>
      </>
    );
  } else {
    panel = (
      <>
        <p className="muted small">Version {hub.live_version} is live. Share it with an expiring link.</p>
        <div className="actions">
          <button className="btn" disabled={busy} onClick={createLink}>Create share link</button>
          <button className="link" disabled={busy} onClick={() => run("newVersion")}>Edit as new version</button>
        </div>
      </>
    );
  }

  return (
    <main className="screen">
      <div className="topbar">
        <BackLink to="/hubs" label="Client hubs" />
        <span className={`status status-${hub.status}`}>{STATUS[hub.status]}</span>
      </div>

      <h1 className="title">{hub.client_name}</h1>
      <p className="muted small" style={{ marginTop: 4 }}>
        {hub.advisor_name}
        {hub.live_version > 0 ? ` · Version ${hub.live_version} live` : " · Not shared yet"}
        {hub.meeting_confirmed ? " · Meeting confirmed" : ""}
      </p>

      <div className="panel">
        {hub.compliance_flags?.length > 0 && (
          <div className="flags">
            <div className="label">Compliance check</div>
            <ul>{hub.compliance_flags.map((f) => <li key={f}>{f}</li>)}</ul>
          </div>
        )}
        {panel}
        {newLink && (
          <div className="newlink">
            <input className="input" readOnly value={newLink.url} onFocus={(e) => e.target.select()} />
            <p className="hint">Expires {formatDate(newLink.expires_at)}. Copy it now: for security it won't be shown again.</p>
          </div>
        )}
      </div>

      <FollowUpEditor key={hub.next_meeting_at || "none"} hub={hub} onSaved={load} notify={notify} />

      <div className="preview-frame">
        <HubView hub={preview} editable={editable} onChange={change}
          action={<button className="btn" disabled>Confirm our next meeting</button>} />
      </div>

      {hub.live_version > 0 && (
        <section className="dash-section">
          <div className="dash-section-head">
            <h2 className="title">Share links</h2>
            {hub.status !== "approved" && (
              <button className="link" disabled={busy} onClick={createLink}>Create share link</button>
            )}
          </div>
          {links.length === 0 ? (
            <p className="muted">No links yet.</p>
          ) : (
            <div className="rows">
              {links.map((l) => (
                <div className="row" key={l.id}>
                  <div className="row-main">
                    <div className="name">{linkState(l)}</div>
                    <div className="muted small">
                      Created {formatDate(l.created_date)} · Expires {formatDate(l.expires_at)} · Opened {l.open_count || 0}×
                    </div>
                  </div>
                  {linkState(l) === "Active" && (
                    <button className="link" disabled={busy} onClick={() => run("revokeLink", { linkId: l.id })}>Revoke</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {versions.length > 0 && (
        <section className="dash-section">
          <h2 className="title">Approved versions</h2>
          <div className="rows">
            {versions.map((v) => (
              <button className="row row-button" key={v.version} onClick={() => navigate(`/hubs/${id}/v/${v.version}`)}>
                <div className="row-main">
                  <div className="name">Version {v.version}{v.version === hub.live_version ? " · Live" : ""}</div>
                  <div className="muted small">Approved by {v.approved_by} · {formatDate(v.approved_at, true)}</div>
                </div>
                <span className="chevron" aria-hidden="true">›</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="dash-section">
        <h2 className="title">Activity</h2>
        <ul className="activity">
          {activity.map((a) => (
            <li key={a.id}>
              <div>{a.action}</div>
              <div className="muted small">
                {a.actor === "client" ? "Client" : a.actor} · {formatDate(a.created_date, true)}
                {a.detail ? ` · ${a.detail}` : ""}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
