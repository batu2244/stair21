import { useEffect, useState } from "react";
import { hubs } from "@/lib/api";
import HubView from "@/components/HubView";
import BackLink from "@/components/BackLink";

// Read-only view of an archived, approved version.
export default function Snapshot({ id, version }) {
  const [snap, setSnap] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    hubs("getSnapshot", { hubId: id, version: Number(version) })
      .then((d) => setSnap(d.snapshot))
      .catch(() => setMissing(true));
  }, [id, version]);

  if (missing) return <main className="screen"><div className="topbar"><BackLink to={`/hubs/${id}`} label="Hub" /></div><p className="muted">Version not found.</p></main>;
  if (!snap) return <div className="spinner" />;

  return (
    <main className="screen">
      <div className="topbar">
        <BackLink to={`/hubs/${id}`} label="Hub" />
        <span className="label">Archived · v{snap.version}</span>
      </div>
      <div className="panel">
        <p className="muted small">
          Prepared by {snap.advisor_name} · Approved by {snap.approved_by} on{" "}
          {new Date(snap.approved_at).toLocaleString()}
        </p>
        {snap.compliance_flags?.length > 0 && (
          <p className="muted small" style={{ marginTop: 8 }}>Approved with flags: {snap.compliance_flags.join(", ")}</p>
        )}
      </div>
      <div className="preview-frame">
        <HubView hub={{ ...snap.content, version: snap.version, approved_at: snap.approved_at }}
          action={<button className="btn" disabled>Confirm our next meeting</button>} />
      </div>
    </main>
  );
}
