import { useState } from "react";
import { hubs } from "@/lib/api";
import Upload from "@/components/Upload";

// Firm branding and compliance settings. Frozen into each hub at approval.
export default function Firm({ me, onSaved, notify }) {
  const f = me.firm || {};
  const [form, setForm] = useState({
    name: f.name || "",
    logo_url: f.logo_url || "",
    portal_url: f.portal_url || "",
    disclosure: f.disclosure || "",
    link_expiry_days: f.link_expiry_days || 30,
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((s) => ({ ...s, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { firm } = await hubs("saveFirm", { firm: form });
      onSaved(firm);
      notify("Saved");
      setBusy(false);
    } catch (err) {
      notify(err.message);
      setBusy(false);
    }
  };

  return (
    <main className="screen">
      <h1 className="headline">Firm</h1>
      <p className="subhead">Branding and compliance settings for every client hub.</p>

      <form onSubmit={save} style={{ marginTop: 48 }}>
        <label className="field">
          <span className="label">Firm name</span>
          <input className="input" value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="Northbridge Wealth" />
        </label>
        <Upload label="Logo" value={form.logo_url} onUploaded={set("logo_url")} />
        <label className="field">
          <span className="label">Default portal link</span>
          <input className="input" value={form.portal_url} onChange={(e) => set("portal_url")(e.target.value)} placeholder="https://portal.yourcustodian.com" />
          <p className="hint">Custodian or planning portal (eMoney, RightCapital…) for balances and documents.</p>
        </label>
        <label className="field">
          <span className="label">Disclosure</span>
          <textarea className="input" rows={4} value={form.disclosure} onChange={(e) => set("disclosure")(e.target.value)}
            placeholder="[Firm] is a registered investment adviser…" />
          <p className="hint">Shown at the bottom of every hub.</p>
        </label>
        <label className="field">
          <span className="label">Share links expire after (days)</span>
          <input className="input" type="number" min={1} max={365} value={form.link_expiry_days}
            onChange={(e) => set("link_expiry_days")(e.target.value)} />
        </label>
        <button className="btn btn-block" type="submit" disabled={busy}>Save</button>
      </form>
    </main>
  );
}
