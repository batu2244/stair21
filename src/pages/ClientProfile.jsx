import { useState } from "react";
import { EXAMPLE_FOLLOW_UPS } from "@/lib/example";
import { confirmExample, isExampleConfirmed } from "@/lib/exampleState";
import { meetingDate, relative } from "@/lib/dates";
import BackLink from "@/components/BackLink";
import "./ClientProfile.css";

const PRIORITY = {
  high: { label: "High priority", pill: "pill-danger" },
  low: { label: "Low priority", pill: "" },
};

function formatDay(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// Client profile for the dashboard's example clients (real clients open their hub).
export default function ClientProfile({ id, notify }) {
  const c = EXAMPLE_FOLLOW_UPS.find((x) => x.id === id);
  const [confirmed, setConfirmed] = useState(!!c?.meeting_confirmed || (c && isExampleConfirmed(c.id)));

  if (!c) {
    return (
      <main className="page">
        <div className="topbar"><BackLink to="/" label="Dashboard" /></div>
        <p className="muted">Client not found.</p>
      </main>
    );
  }

  const p = c.profile || {};
  const pr = PRIORITY[c.priority];
  const facts = [
    { label: "Tier", value: p.tier ? `Tier ${p.tier}` : "—" },
    { label: "Assets under management", value: p.aum || "—" },
    { label: "Owner", value: p.owner || "—" },
    { label: "Last contact", value: formatDay(c.last_contact_at) },
  ];

  return (
    <main className="page cp-page">
      <div className="topbar"><BackLink to="/" label="Dashboard" /></div>

      <header className="cp-head">
        <div className="cp-avatar" aria-hidden="true">{initials(c.client_name)}</div>
        <div>
          <div className="eyebrow">Client profile</div>
          <h1 className="page-title">{c.client_name}</h1>
          <div className="cp-tags">
            {pr && <span className={`pill ${pr.pill}`}>{pr.label}</span>}
            {p.tier && <span className="pill pill-draft">Tier {p.tier}</span>}
          </div>
        </div>
      </header>

      <div className="kpis kpis-4">
        {facts.map((f) => (
          <div className="kpi" key={f.label}>
            <div className="kpi-label">{f.label}</div>
            <div className="kpi-value cp-fact">{f.value}</div>
          </div>
        ))}
      </div>

      <div className="cp-grid">
        <div className="cp-col">
          <section className="panel-card">
            <div className="card-head"><h2 className="card-title">Why we're following up</h2></div>
            <div className="pad cp-why">
              {p.situation && (
                <div>
                  <div className="label">Situation</div>
                  <p className="cp-big">{p.situation}</p>
                </div>
              )}
              {p.action && (
                <div>
                  <div className="label">Next action</div>
                  <p className="cp-big">{p.action}</p>
                </div>
              )}
              {c.follow_up_note && (
                <div>
                  <div className="label">Internal note</div>
                  <p className="muted">{c.follow_up_note}</p>
                </div>
              )}
            </div>
          </section>

          {p.accounts?.length > 0 && (
            <section className="panel-card">
              <div className="card-head">
                <h2 className="card-title">Accounts</h2>
                <span className="muted small">{p.aum} total</span>
              </div>
              <div className="table-wrap">
                <table className="table cp-accounts">
                  <thead>
                    <tr><th>Account</th><th>Type</th><th className="num">Value</th></tr>
                  </thead>
                  <tbody>
                    {p.accounts.map((a) => (
                      <tr key={a.name}>
                        <td className="strong">{a.name}</td>
                        <td className="muted">{a.type}</td>
                        <td className="num strong">{a.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        <div className="cp-col">
          <section className="panel-card">
            <div className="card-head"><h2 className="card-title">Next follow-up</h2></div>
            <div className="pad">
              {c.next_meeting_at ? (
                <>
                  <div className="cp-when">{relative(c.next_meeting_at)}</div>
                  <div className="muted">{meetingDate(c.next_meeting_at)}</div>
                  <div style={{ marginTop: 18 }}>
                    {confirmed ? (
                      <span className="pill pill-ok">Confirmed</span>
                    ) : (
                      <button className="btn btn-sm" onClick={() => { confirmExample(c.id); setConfirmed(true); notify("Meeting confirmed"); }}>
                        Confirm meeting
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="muted">No follow-up scheduled.</p>
              )}
            </div>
          </section>

          {(p.email || p.phone) && (
            <section className="panel-card">
              <div className="card-head"><h2 className="card-title">Contact</h2></div>
              <dl className="pad cp-details">
                {p.email && (<><dt>Email</dt><dd><a className="link" href={`mailto:${p.email}`}>{p.email}</a></dd></>)}
                {p.phone && (<><dt>Phone</dt><dd><a className="link" href={`tel:${p.phone.replace(/[^0-9+]/g, "")}`}>{p.phone}</a></dd></>)}
                {p.location && (<><dt>Location</dt><dd>{p.location}</dd></>)}
                {p.household && (<><dt>Household</dt><dd>{p.household}</dd></>)}
                {p.client_since && (<><dt>Client since</dt><dd>{p.client_since}</dd></>)}
                {p.risk && (<><dt>Risk profile</dt><dd>{p.risk}</dd></>)}
              </dl>
            </section>
          )}

          {p.activity?.length > 0 && (
            <section className="panel-card">
              <div className="card-head"><h2 className="card-title">Recent activity</h2></div>
              <ul className="pad cp-activity">
                {p.activity.map((a) => (
                  <li key={a.at + a.text}>
                    <div>{a.text}</div>
                    <div className="muted small">{formatDay(a.at)}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
