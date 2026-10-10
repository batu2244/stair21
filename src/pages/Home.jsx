import { navigate } from "@/lib/router";
import { EXAMPLE_HUB } from "@/lib/example";
import { useHubs, groupFollowUps } from "@/lib/useHubs";
import FollowUpList from "@/components/FollowUpList";

// Dashboard: KPIs and what needs attention.
export default function Home({ me }) {
  const list = useHubs();
  const all = list || [];
  const drafts = all.filter((h) => h.status === "draft");
  const fu = groupFollowUps(all);
  const firstName = (me.profile?.name || "").split(" ")[0];
  const loading = list === null;

  const kpis = [
    { label: "Client hubs", value: all.length },
    { label: "Live", value: all.filter((h) => h.live_version > 0).length },
    { label: "Awaiting sign-off", value: drafts.length, warn: drafts.length > 0 },
    { label: "Follow-ups · 7 days", value: fu.week.length },
    { label: "Overdue follow-ups", value: fu.overdue.length, danger: fu.overdue.length > 0 },
    { label: "Meetings confirmed", value: all.filter((h) => h.meeting_confirmed).length },
  ];
  const upcoming = [...fu.overdue, ...fu.week];

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1 className="page-title">Good to see you, {firstName}.</h1>
        </div>
      </div>

      <div className="kpis">
        {kpis.map((k) => (
          <div className="kpi" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-value${k.warn ? " warn" : ""}${k.danger ? " danger" : ""}`}>{loading ? "–" : k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <section className="panel-card">
          <div className="card-head">
            <h2 className="card-title">Upcoming follow-ups</h2>
            <button className="link small" onClick={() => navigate("/follow-ups")}>View all</button>
          </div>
          {loading ? <p className="muted pad">Loading…</p>
            : upcoming.length === 0 ? <p className="muted pad">Nothing in the next 7 days.</p>
            : (
              <>
                {fu.overdue.length > 0 && <FollowUpList items={fu.overdue} overdue />}
                {fu.week.length > 0 && <FollowUpList items={fu.week} />}
              </>
            )}
        </section>

        <section className="panel-card">
          <div className="card-head">
            <h2 className="card-title">Awaiting compliance sign-off</h2>
            <button className="link small" onClick={() => navigate("/hubs")}>All hubs</button>
          </div>
          {loading ? <p className="muted pad">Loading…</p>
            : drafts.length === 0 ? <p className="muted pad">Nothing waiting.</p>
            : (
              <div className="list">
                {drafts.slice(0, 6).map((h) => (
                  <button className="fu-row" key={h.id} onClick={() => navigate(`/hubs/${h.id}`)}>
                    <div className="fu-main">
                      <div className="strong">{h.client_name}</div>
                      <div className="muted small">{h.live_version > 0 ? `New version · v${h.live_version} live` : "First version"}</div>
                    </div>
                    {h.compliance_flags?.length > 0
                      ? <span className="pill pill-warn">{h.compliance_flags.length} flag{h.compliance_flags.length > 1 ? "s" : ""}</span>
                      : <span className="pill">Clear</span>}
                  </button>
                ))}
              </div>
            )}
          <div className="card-foot">
            <button className="fu-row" onClick={() => navigate("/c/example")}>
              <div className="fu-main">
                <div className="strong">Example · {EXAMPLE_HUB.client_name}</div>
                <div className="muted small">See what your clients receive</div>
              </div>
              <span className="chevron" aria-hidden="true">›</span>
            </button>
          </div>
        </section>
      </div>

    </main>
  );
}
