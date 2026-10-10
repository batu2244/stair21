import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function Upload({ label, value, round, onUploaded }) {
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onUploaded(file_url);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="field">
      <span className="label">{label}</span>
      <div className="upload">
        {value && <img src={value} alt="" className={round ? "round" : ""} />}
        <label className="link" style={{ cursor: "pointer" }}>
          {busy ? "Uploading…" : value ? "Change" : "Choose image"}
          <input type="file" accept="image/*" onChange={pick} hidden />
        </label>
      </div>
    </div>
  );
}
