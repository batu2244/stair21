import { useState } from "react";
import { hubs } from "@/lib/api";
import { hideExample } from "@/lib/exampleState";
import "./DeleteClient.css";

// Two-step "Delete" for a client. Real clients are archived: hidden everywhere
// and their share links revoked, while approved versions stay on record.
// Built-in examples are hidden in this browser.
export default function DeleteClient({ client, onDeleted, notify, compact = false }) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  const remove = async (e) => {
    e?.stopPropagation();
    setBusy(true);
    try {
      if (client.example) hideExample(client.id);
      else await hubs("archiveHub", { hubId: client.id });
      notify(`${client.client_name} deleted`);
      onDeleted(client);
    } catch (err) {
      notify(err.message);
      setBusy(false);
    }
  };

  const stop = (e) => e.stopPropagation();

  if (!asking) {
    return (
      <button className="link small delete-link" onClick={(e) => { stop(e); setAsking(true); }}>
        {compact ? "Delete" : "Delete client"}
      </button>
    );
  }
  return (
    <span className="delete-confirm" onClick={stop}>
      <span className="small">
        Delete {client.client_name}?{!client.example && client.live_version > 0 ? " Their link stops working." : ""}
      </span>
      <button className="btn btn-sm btn-danger" disabled={busy} onClick={remove}>{busy ? "Deleting…" : "Delete"}</button>
      <button className="link small" disabled={busy} onClick={(e) => { stop(e); setAsking(false); }}>Cancel</button>
    </span>
  );
}
