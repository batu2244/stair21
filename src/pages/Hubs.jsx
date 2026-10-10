import { useState } from "react";
import { useHubs } from "@/lib/useHubs";
import HubTable from "@/components/HubTable";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Awaiting sign-off" },
  { key: "live", label: "Live" },
  { key: "nofollowup", label: "No follow-up" },
];

export default function Hubs() {
  const list = useHubs();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const all = list || [];
  const shown = all
    .filter((h) =>
      filter === "all" ? true
        : filter === "draft" ? h.status === "draft"
        : filter === "live" ? h.live_version > 0
        : !h.next_meeting_at)
    .filter((h) => h.client_name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Client hubs</div>
          <h1 className="page-title">{list === null ? "Client hubs" : `${all.length} client hub${all.length === 1 ? "" : "s"}`}</h1>
        </div>
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
          <input className="input input-sm search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients" aria-label="Search clients" />
        </div>
        {list === null ? <p className="muted pad">Loading…</p>
          : <HubTable items={shown} empty={all.length ? "No hubs match." : "No client hubs yet. Create one after your next meeting."} />}
      </section>
    </main>
  );
}
