import { navigate } from "@/lib/router";
import { useHubs, groupFollowUps } from "@/lib/useHubs";
import FollowUpList from "@/components/FollowUpList";

export default function FollowUps() {
  const list = useHubs();
  const fu = groupFollowUps(list || []);
  const groups = [
    { key: "overdue", label: "Overdue", items: fu.overdue, overdue: true },
    { key: "week", label: "Next 7 days", items: fu.week },
    { key: "later", label: "Later", items: fu.later },
  ];

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Follow-ups</div>
          <h1 className="page-title">Your schedule</h1>
        </div>
      </div>

      {list === null ? <p className="muted">Loading…</p> : (
        <div className="grid-2">
          <div>
            {groups.map((g) => (
              <section className="panel-card" key={g.key} style={{ marginBottom: 20 }}>
                <div className="card-head">
                  <h2 className={`card-title${g.overdue && g.items.length ? " danger" : ""}`}>{g.label}</h2>
                  <span className="muted small">{g.items.length}</span>
                </div>
                {g.items.length ? <FollowUpList items={g.items} overdue={g.overdue} /> : <p className="muted pad">None.</p>}
              </section>
            ))}
          </div>
          <section className="panel-card" style={{ alignSelf: "start" }}>
            <div className="card-head">
              <h2 className="card-title">No follow-up set</h2>
              <span className="muted small">{fu.unscheduled.length}</span>
            </div>
            {fu.unscheduled.length === 0 ? <p className="muted pad">Every client has a follow-up.</p> : (
              <div className="list">
                {fu.unscheduled.map((h) => (
                  <button className="fu-row" key={h.id} onClick={() => navigate(`/hubs/${h.id}`)}>
                    <div className="fu-main"><div className="strong">{h.client_name}</div></div>
                    <span className="link small">Schedule ›</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
