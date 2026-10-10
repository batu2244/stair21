import { useState } from "react";
import { navigate } from "@/lib/router";
import { hubs } from "@/lib/api";
import Upload from "@/components/Upload";

export default function Profile({ me, onSaved }) {
  const profile = me.profile;
  const first = !profile;
  const [form, setForm] = useState({
    name: profile?.name || "",
    title: profile?.title || "",
    photo_url: profile?.photo_url || "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      const { profile } = await hubs("saveProfile", { profile: form });
      onSaved(profile);
      if (first) navigate("/");
      setBusy(false);
    } catch {
      setBusy(false);
    }
  };

  return (
    <main className="screen">
      <h1 className="headline">{first ? "Welcome." : "Your profile"}</h1>
      <p className="subhead">This is how you'll appear on your clients' hubs.</p>

      <form onSubmit={save} style={{ marginTop: 48 }}>
        <label className="field">
          <span className="label">Your name</span>
          <input className="input" value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="Sarah Chen" autoFocus />
        </label>
        <label className="field">
          <span className="label">Title</span>
          <input className="input" value={form.title} onChange={(e) => set("title")(e.target.value)} placeholder="Wealth Advisor" />
        </label>
        <Upload label="Your photo" value={form.photo_url} round onUploaded={set("photo_url")} />

        <button className="btn btn-block" type="submit" disabled={!form.name.trim() || busy} style={{ marginTop: 24 }}>
          {first ? "Continue" : "Save"}
        </button>
      </form>
    </main>
  );
}
