import { useEffect, useState } from "react";
import { clientHub } from "@/lib/api";
import { EXAMPLE_HUB } from "@/lib/example";
import HubView from "@/components/HubView";
import BackLink from "@/components/BackLink";

// What the client sees, opened from an expiring share link.
export default function ClientView({ token }) {
  const isExample = token === "example";
  const [hub, setHub] = useState(isExample ? EXAMPLE_HUB : null);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isExample) return;
    clientHub("view", token)
      .then((d) => {
        setHub(d.hub);
        setConfirmed(!!d.hub.meeting_confirmed);
      })
      .catch((err) => setError(err.status === 410 ? "expired" : "unavailable"));
  }, [token, isExample]);

  const confirm = async () => {
    if (isExample) return setConfirmed(true);
    setBusy(true);
    try {
      await clientHub("confirm", token);
      setConfirmed(true);
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <main className="screen" style={{ textAlign: "center", paddingTop: 160 }}>
        <h1 className="title">{error === "expired" ? "This link has expired." : "This page isn't available."}</h1>
        <p className="subhead">Please ask your advisor for a new link.</p>
      </main>
    );
  }
  if (!hub) return <div className="spinner" />;

  return (
    <main className="screen">
      {isExample && (
        <div className="topbar">
          <BackLink to="/" label="Dashboard" />
          <span className="label">Example</span>
        </div>
      )}
      <HubView
        hub={hub}
        action={
          confirmed ? (
            <p className="title">Thank you. See you soon.</p>
          ) : (
            <button className="btn" onClick={confirm} disabled={busy}>Confirm our next meeting</button>
          )
        }
      />
    </main>
  );
}
