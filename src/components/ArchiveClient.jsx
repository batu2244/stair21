import { useState } from "react";
import { hubs } from "@/lib/api";
import "./ArchiveClient.css";

// Two-step "Archive client" link. Archiving hides the client and revokes its
// share links; approved versions stay on record.
export default function ArchiveClient({ hubId, name, onArchived, notify }) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  const archive = async () => {
    setBusy(true);
    try {
      await hubs("archiveHub", { hubId });
      notify(`${name} archived`);
      onArchived();
    } catch (err) {
      notify(err.message);
      setBusy(false);
    }
  };

  if (!asking) {
    return <button className="link small archive-link" onClick={() => setAsking(true)}>Archive client</button>;
  }
  return (
    <span className="archive-confirm">
      <span className="small">Archive {name}? Their link stops working.</span>
      <button className="btn btn-sm btn-danger" disabled={busy} onClick={archive}>{busy ? "Archiving…" : "Archive"}</button>
      <button className="link small" disabled={busy} onClick={() => setAsking(false)}>Cancel</button>
    </span>
  );
}
