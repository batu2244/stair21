import { Fragment, useEffect, useState } from "react";
import { hubs } from "@/lib/api";
import { navigate } from "@/lib/router";
import { fromLocalInput, toLocalInput, relative, shortDay, timeOf } from "@/lib/dates";
import { EXAMPLE_FOLLOW_UPS } from "@/lib/example";
import ArchiveClient from "@/components/ArchiveClient";
import { isExampleConfirmed } from "@/lib/exampleState";
import { WithBottomBanner } from "@/components/WealthBanner";

// Dashboard: the follow-up manager. Who to contact, when, and whether they've confirmed.
// Built-in example rows (h.example) are read-only and sit alongside real clients.

function startOfToday() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function stateOf(h) {
  if (!h.next_meeting_at) return "none";
  const at = new Date(h.next_meeting_at);
  const today = startOfToday();
  if (at < today) return "overdue";
  if (at < new Date(today.getTime() + 86400000)) return "today";
  if (at < new Date(today.getTime() + 7 * 86400000)) return "week";
  return "later";
}

const STATE = {
  overdue: { label: "Overdue", pill: "pill-danger" },
  today: { label: "Today", pill: "pill-warn" },
  week: { label: "This week", pill: "pill-draft" },
  later: { label: "Upcoming", pill: "" },
  none: { label: "Not scheduled", pill: "" },
};
const ORDER = { overdue: 0, today: 1, week: 2, later: 3, none: 4 };
const PRIORITY = { high: { label: "High", pill: "pill-danger" }, low: { label: "Low", pill: "" } };

const waitingOnClient = (h) => h.next_meeting_at && h.live_version > 0 && !h.meeting_confirmed && stateOf(h) !== "overdue";

const FILTERS = [
  { key: "all", label: "All", test: () => true },
  { key: "overdue", label: "Overdue", test: (h) => stateOf(h) === "overdue" },
  { key: "week", label: "Next 7 days", test: (h) => ["today", "week"].includes(stateOf(h)) },
  { key: "later", label: "Later", test: (h) => stateOf(h) === "later" },
  { key: "waiting", label: "Waiting on client", test: waitingOnClient },
  { key: "none", label: "Not scheduled", test: (h) => stateOf(h) === "none" },
];

function formatDay(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}

// Inline editor shown under a row.
function Manage({ h, onDone, notify }) {
  const [when, setWhen] = useState(toLocalInput(h.next_meeting_at));
  const [note, setNote] = useState(h.follow_up_note || "");
  const [busy, setBusy] = useState(false);
  const changedDate = fromLocalInput(when) !== (h.next_meeting_at || "");

  const save = async (extra = {}, msg = "Saved") => {
    setBusy(true);
    try {
      await hubs("setFollowUp", { hubId: h.id, next_meeting_at: fromLocalInput(when), follow_up_note: note.trim(), ...extra });
      notify(msg);
      onDone();
    } catch (err) {
      notify(err.message);
      setBusy(false);
    }
  };

  // The client confirmed the next meeting (e.g. by phone).
  const confirm = async () => {
    setBusy(true);
    try {
      await hubs("confirmMeeting", { hubId: h.id });
      notify("Meeting confirmed");
      onDone();
    } catch (err) {
      notify(err.message);
      setBusy(false);
    }
  };

  // Mark done records the contact. A newly picked date becomes the next follow-up.
  const markDone = () =>
    save(
      { completed: true, next_meeting_at: changedDate ? fromLocalInput(when) : "", follow_up_note: changedDate ? note.trim() : "" },
      changedDate ? "Done. Next follow-up scheduled" : "Marked done"
    );

  return (
    <div className="fu-manage">
      <div className="fu-manage-grid">
        <label>
          <span className="label">{h.next_meeting_at ? "Next follow-up" : "Schedule follow-up"}</span>
          <input className="input input-sm" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </label>
        <label>
          <span className="label">Internal note</span>
          <input className="input input-sm" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Check the rollover forms arrived" maxLength={300} />
        </label>
      </div>
      <div className="actions" style={{ marginTop: 12 }}>
        <button className="btn btn-sm" disabled={busy || !when || (!changedDate && note.trim() === (h.follow_up_note || ""))}
          onClick={() => save({}, h.next_meeting_at ? "Follow-up updated" : "Follow-up scheduled")}>
          {h.next_meeting_at ? "Save changes" : "Schedule"}
        </button>
        {h.next_meeting_at && !h.meeting_confirmed && (
          <button className="btn btn-sm btn-secondary" disabled={busy} onClick={confirm}>Confirm meeting</button>
        )}
        {h.next_meeting_at && (
          <button className="btn btn-sm btn-secondary" disabled={busy} onClick={markDone}>Mark done</button>
        )}
        {h.next_meeting_at && (
          <button className="link small" disabled={busy}
            onClick={() => save({ next_meeting_at: "", follow_up_note: "" }, "Follow-up cleared")}>
            Clear
          </button>
        )}
        <button className="link small" onClick={() => navigate(`/hubs/${h.id}`)}>Open hub ›</button>
        <ArchiveClient hubId={h.id} name={h.client_name} onArchived={onDone} notify={notify} />
      </div>
      {h.next_meeting_at && (
        <p className="hint">Mark done records the contact. Pick a new date first to schedule the next follow-up at the same time.</p>
      )}
    </div>
  );
}

export default function FollowUps({ me, notify }) {
  const [list, setList] = useState(null);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);

  const load = () => hubs("listHubs").then((d) => setList(d.hubs)).catch(() => setList([]));
  useEffect(() => { load(); }, []);

  const all = list
    ? [...list, ...EXAMPLE_FOLLOW_UPS].map((h) => (h.example && isExampleConfirmed(h.id) ? { ...h, meeting_confirmed: true } : h))
    : [];

  const firstName = (me?.profile?.name || "").split(" ")[0];
  const count = (key) => all.filter(FILTERS.find((f) => f.key === key).test).length;
  const kpis = [
    { key: "overdue", label: "Overdue", value: count("overdue"), cls: count("overdue") ? "danger" : "" },
    { key: "week", label: "Next 7 days", value: count("week") },
    { key: "waiting", label: "Waiting on client", value: count("waiting"), cls: count("waiting") ? "warn" : "" },
    { key: "none", label: "Not scheduled", value: count("none") },
  ];

  const test = FILTERS.find((f) => f.key === filter).test;
  const rows = all
    .filter(test)
    .filter((h) => h.client_name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) =>
      ORDER[stateOf(a)] - ORDER[stateOf(b)] ||
      (a.next_meeting_at || "").localeCompare(b.next_meeting_at || "") ||
      a.client_name.localeCompare(b.client_name));

  const done = () => { setOpen(null); load(); };

  return (
    <WithBottomBanner>
      <main className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Dashboard</div>
            <h1 className="page-title">Good to see you{firstName ? `, ${firstName}` : ""}.</h1>
            <p className="subhead">Who to follow up with, and when.</p>
          </div>
        </div>

        <div className="kpis kpis-4">
          {kpis.map((k) => (
            <button className={`kpi kpi-button${filter === k.key ? " active" : ""}`} key={k.key}
              onClick={() => setFilter(filter === k.key ? "all" : k.key)}>
              <div className="kpi-label">{k.label}</div>
              <div className={`kpi-value ${k.cls}`}>{list === null ? "–" : k.value}</div>
            </button>
          ))}
        </div>

        <section className="panel-card">
          <div className="card-head">
            <div className="segmented" role="tablist">
              {FILTERS.map((f) => (
                <button key={f.key} role="tab" aria-selected={filter === f.key}
                  className={filter === f.key ? "active" : ""} onClick={() => setFilter(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>
            <input className="input input-sm search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search clients" aria-label="Search clients" />
          </div>

          {list === null ? <p className="muted pad">Loading…</p>
            : rows.length === 0 ? (
              <p className="muted pad">{all.length ? "Nobody here." : "No clients yet. Create a client hub to start tracking follow-ups."}</p>
            ) : (
              <div className="table-wrap">
                <table className="table fu-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Priority</th>
                      <th>Next follow-up</th>
                      <th>Status</th>
                      <th>Confirmed</th>
                      <th className="fu-col-last">Last contact</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((h) => {
                      const st = stateOf(h);
                      const isOpen = !h.example && open === h.id;
                      const pr = PRIORITY[h.priority];
                      return (
                        <Fragment key={h.id}>
                          <tr className={isOpen ? "open" : ""}
                            onClick={() => (h.example ? navigate(`/clients/${h.id}`) : setOpen(isOpen ? null : h.id))}>
                            <td className="strong">
                              {h.client_name}
                            </td>
                            <td>{pr ? <span className={`pill ${pr.pill}`}>{pr.label}</span> : <span className="muted">—</span>}</td>
                            <td>
                              {h.next_meeting_at ? (
                                <>
                                  <div className={st === "overdue" ? "danger strong" : "strong"}>{relative(h.next_meeting_at)}</div>
                                  <div className="muted small">{shortDay(h.next_meeting_at)}, {timeOf(h.next_meeting_at)}</div>
                                </>
                              ) : <span className="muted">—</span>}
                            </td>
                            <td><span className={`pill ${STATE[st].pill}`}>{STATE[st].label}</span></td>
                            <td>
                              {!h.next_meeting_at ? <span className="muted">—</span>
                                : h.meeting_confirmed ? <span className="pill pill-ok">Confirmed</span>
                                : <span className="muted">Not yet</span>}
                            </td>
                            <td className="muted fu-col-last">{formatDay(h.last_contact_at)}</td>
                            <td className="num">
                              {!h.example && <button className="link small" onClick={(e) => { e.stopPropagation(); setOpen(isOpen ? null : h.id); }}>
                                {isOpen ? "Close" : h.next_meeting_at ? "Manage" : "Schedule"}
                              </button>}
                            </td>
                          </tr>
                          {isOpen && (
                            <tr className="fu-manage-row">
                              <td colSpan={7}><Manage h={h} onDone={done} notify={notify} /></td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </section>

      </main>
    </WithBottomBanner>
  );
}
