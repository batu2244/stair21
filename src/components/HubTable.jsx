import { STATUS } from "@/lib/api";
import { navigate } from "@/lib/router";
import { relative, shortDay } from "@/lib/dates";

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}

// Data table of client hubs.
export default function HubTable({ items, empty = "Nothing here." }) {
  if (!items.length) return <div className="table-empty muted">{empty}</div>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Status</th>
            <th className="num">Live version</th>
            <th>Next meeting</th>
            <th>Compliance</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((h) => (
            <tr key={h.id} onClick={() => navigate(`/hubs/${h.id}`)} tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/hubs/${h.id}`)}>
              <td className="strong">{h.client_name}</td>
              <td><span className={`pill pill-${h.status}`}>{STATUS[h.status]}</span></td>
              <td className="num">{h.live_version > 0 ? `v${h.live_version}` : "—"}</td>
              <td>
                {h.next_meeting_at ? (
                  <>
                    {shortDay(h.next_meeting_at)}{" "}
                    <span className="muted">· {relative(h.next_meeting_at)}</span>
                    {h.meeting_confirmed && <span className="dot-ok" title="Confirmed by client" />}
                  </>
                ) : <span className="muted">—</span>}
              </td>
              <td>
                {h.status === "draft" && h.compliance_flags?.length > 0
                  ? <span className="pill pill-warn">{h.compliance_flags.length} flag{h.compliance_flags.length > 1 ? "s" : ""}</span>
                  : <span className="muted">{h.status === "draft" ? "Clear" : "Signed off"}</span>}
              </td>
              <td className="muted">{formatDate(h.updated_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
