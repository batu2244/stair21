import { useState } from "react";
import { navigate } from "@/lib/router";
import { useHubs } from "@/lib/useHubs";
import { visibleExamples } from "@/lib/exampleState";
import DeleteClient from "@/components/DeleteClient";
import { relative, shortDay } from "@/lib/dates";

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function summary(c) {
  const next = c.next_meeting_at
    ? `Next follow-up ${relative(c.next_meeting_at).toLowerCase()} · ${shortDay(c.next_meeting_at)}`
    : "No follow-up scheduled";
  const p = c.profile || {};
  return [p.tier && `Tier ${String(p.tier).replace(/^Tier\s+/i, "")}`, p.aum && `AUM ${p.aum}`, next].filter(Boolean).join(" · ");
}

// Client Hub: every client, A to Z. Example clients open their profile; real ones open their hub.
export default function Hubs({ notify }) {
  const list = useHubs();
  const [q, setQ] = useState("");
  const [removed, setRemoved] = useState(() => new Set());
  const clients = [...(list || []), ...visibleExamples()]
    .filter((c) => !removed.has(c.id))
    .filter((c) => c.client_name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.client_name.localeCompare(b.client_name));
  const open = (c) => navigate(c.example ? `/clients/${c.id}` : `/hubs/${c.id}`);

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Client Hub</div>
          <h1 className="page-title">All clients</h1>
        </div>
        <input className="input input-sm search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search clients" aria-label="Search clients" />
      </div>

      <section className="panel-card">
        {list === null ? <p className="muted pad">Loading…</p>
          : clients.length === 0 ? <p className="muted pad">No clients match.</p>
          : (
            <div className="list">
              {clients.map((c) => (
                <div className="fu-row hub-row" key={c.id} onClick={() => open(c)}>
                  <span className="avatar avatar-sm" aria-hidden="true">{initials(c.client_name)}</span>
                  <button className="fu-main hub-open" onClick={(e) => { e.stopPropagation(); open(c); }}>
                    <div className="strong">{c.client_name}</div>
                    <div className="muted small">{summary(c)}</div>
                  </button>
                  <DeleteClient compact client={c} notify={notify}
                    onDeleted={() => setRemoved((s) => new Set(s).add(c.id))} />
                  <span className="chevron" aria-hidden="true">›</span>
                </div>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}
