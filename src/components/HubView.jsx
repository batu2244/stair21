import { useEffect, useRef } from "react";
import { meetingDate } from "@/lib/dates";

// Plain text that becomes editable in edit mode. Uncontrolled so the caret
// doesn't jump; reports the new text on blur.
function Text({ as: Tag = "span", value, editable, onChange, placeholder, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && ref.current.textContent !== (value || "")) ref.current.textContent = value || "";
  }, [value, editable]);

  if (!editable) return <Tag className={className}>{value}</Tag>;
  return (
    <Tag
      ref={ref}
      className={`editable ${className}`}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onBlur={(e) => {
        const next = e.currentTarget.textContent.trim();
        if (next !== (value || "")) onChange(next);
      }}
    />
  );
}

// An editable list: clearing an item removes it.
function Items({ items = [], editable, onChange, placeholder, render }) {
  const set = (i) => (v) => {
    const next = [...items];
    next[i] = v;
    onChange(next.filter(Boolean));
  };
  return (
    <>
      {items.map((item, i) => render(<Text value={item} editable={editable} onChange={set(i)} placeholder={placeholder} />, i))}
      {editable && (
        <button className="link small add" onClick={() => onChange([...items, `New ${placeholder.toLowerCase()}`])}>
          + Add {placeholder.toLowerCase()}
        </button>
      )}
    </>
  );
}

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";
}

// The client hub template. `hub` holds the slot values; in edit mode, changes
// are reported through onChange(patch).
export default function HubView({ hub, editable = false, onChange, action }) {
  const set = (field) => (v) => onChange({ [field]: v });
  const setReading = (i, key) => (v) => {
    onChange({ readings: (hub.readings || []).map((r, j) => (j === i ? { ...r, [key]: v } : r)) });
  };

  return (
    <div className="hub">
      {(hub.firm_logo_url || hub.firm_name) && (
        <div style={{ marginBottom: 56 }}>
          {hub.firm_logo_url ? (
            <img className="cp-logo" src={hub.firm_logo_url} alt={hub.firm_name || "Firm logo"} />
          ) : (
            <span className="cp-company">{hub.firm_name}</span>
          )}
        </div>
      )}

      <h1 className="headline">
        Welcome, <Text value={hub.first_name} editable={editable} onChange={set("first_name")} placeholder="Name" />
      </h1>

      <div className="cp-advisor">
        {hub.advisor_photo_url ? (
          <img className="avatar" src={hub.advisor_photo_url} alt={hub.advisor_name} />
        ) : (
          <div className="avatar">{initials(hub.advisor_name)}</div>
        )}
        <div>
          <div style={{ fontWeight: 600 }}>{hub.advisor_name}</div>
          <div className="muted small">
            {hub.advisor_title || "Your advisor"}
            {hub.firm_name ? `, ${hub.firm_name}` : ""}
          </div>
        </div>
      </div>

      <section className="section">
        <h2 className="title">Your goals</h2>
        <ul className="goals">
          <Items items={hub.goals} editable={editable} onChange={set("goals")} placeholder="Goal"
            render={(text, i) => <li key={i}>{text}</li>} />
        </ul>
      </section>

      <section className="section">
        <h2 className="title">Your plan, in plain words</h2>
        <Text as="p" value={hub.plan_summary} editable={editable} onChange={set("plan_summary")} placeholder="Plan summary" />
      </section>

      <section className="section">
        <h2 className="title">What we talked about</h2>
        <Text as="p" value={hub.recap} editable={editable} onChange={set("recap")} placeholder="Recap" />
      </section>

      <section className="section">
        <h2 className="title">Your next steps</h2>
        <ul className="checklist">
          <Items items={hub.steps} editable={editable} onChange={set("steps")} placeholder="Step"
            render={(text, i) => (
              <li key={i}>
                <span className="check" aria-hidden="true" />
                {text}
              </li>
            )} />
        </ul>
      </section>

      {(editable || hub.advisor_note) && (
        <section className="section">
          <h2 className="title">A note from {hub.advisor_name?.split(" ")[0] || "your advisor"}</h2>
          <Text as="p" value={hub.advisor_note} editable={editable} onChange={set("advisor_note")}
            placeholder="Add a personal note (optional)" className="note" />
        </section>
      )}

      <section className="section">
        <h2 className="title">Worth reading</h2>
        {(hub.readings || []).map((r, i) => (
          <div className="card" key={i}>
            <Text as="h3" value={r.title} editable={editable} onChange={setReading(i, "title")} placeholder="Title" />
            <Text as="p" value={r.body} editable={editable} onChange={setReading(i, "body")} placeholder="Explainer" />
          </div>
        ))}
      </section>

      {hub.portal_url && (
        <section className="section">
          <h2 className="title">Your accounts</h2>
          <p className="muted">Balances and account details are kept in your secure portal.</p>
          <a className="link" href={hub.portal_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 12 }}>
            Open your portal ›
          </a>
        </section>
      )}

      {hub.next_meeting_at && (
        <section className="section">
          <div className="meeting">
            <div className="label">Our next meeting</div>
            <div className="meeting-date">{meetingDate(hub.next_meeting_at)}</div>
            {action && <div style={{ marginTop: 20 }}>{action}</div>}
          </div>
        </section>
      )}

      {action && !hub.next_meeting_at && <div className="cta">{action}</div>}

      <footer className="footer">
        <p>For information only. Not investment advice.</p>
        {hub.disclosure && <p style={{ marginTop: 8 }}>{hub.disclosure}</p>}
        {hub.version > 0 && (
          <p style={{ marginTop: 8 }}>
            Version {hub.version}
            {hub.approved_at ? ` · Approved ${formatDate(hub.approved_at)}` : ""}
          </p>
        )}
      </footer>
    </div>
  );
}
