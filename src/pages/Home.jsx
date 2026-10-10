import { navigate } from "@/lib/router";
import { EXAMPLE_FOLLOW_UPS } from "@/lib/example";
import { useHubs, groupFollowUps } from "@/lib/useHubs";
import FollowUpList from "@/components/FollowUpList";
import { WithBottomBanner } from "@/components/WealthBanner";

// Dashboard: KPIs and what needs attention.
export default function Home({ me }) {
  const list = useHubs();
  const all = list || [];
  const fu = groupFollowUps(all);
  const firstName = (me.profile?.name || "").split(" ")[0];
  const loading = list === null;

  const kpis = [
    { label: "Client hubs", value: all.length },
    { label: "Live", value: all.filter((h) => h.live_version > 0).length },
    { label: "Meetings confirmed", value: all.filter((h) => h.meeting_confirmed).length },
  ];
  const upcoming = [...fu.overdue, ...fu.week];

  return (
    <WithBottomBanner>
      <main className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Dashboard</div>
            <h1 className="page-title">Good to see you, {firstName}.</h1>
          </div>
        </div>

        <div className="kpis kpis-3">
          {kpis.map((k) => (
            <div className="kpi" key={k.label}>
              <div className="kpi-label">{k.label}</div>
              <div className={`kpi-value${k.warn ? " warn" : ""}${k.danger ? " danger" : ""}`}>{loading ? "–" : k.value}</div>
            </div>
          ))}
        </div>

        <section className="panel-card">
          <div className="card-head">
            <h2 className="card-title">Upcoming follow-ups</h2>
            <button className="link small" onClick={() => navigate("/follow-ups")}>View all</button>
          </div>
          {loading ? <p className="muted pad">Loading…</p>
            : (
              <>
                {fu.overdue.length > 0 && <FollowUpList items={fu.overdue} overdue />}
                {fu.week.length > 0 && <FollowUpList items={fu.week} />}
                {upcoming.length > 0 && <div className="card-foot" />}
                <FollowUpList items={EXAMPLE_FOLLOW_UPS} />
              </>
            )}
        </section>

      </main>
    </WithBottomBanner>
  );
}
