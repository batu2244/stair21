import { navigate } from "@/lib/router";

const TABS = [
  { key: "dashboard", label: "Dashboard", to: "/" },
  { key: "hubs", label: "Client hubs", to: "/hubs" },
  { key: "followups", label: "Follow-ups", to: "/follow-ups" },
  { key: "firm", label: "Firm", to: "/firm" },
  { key: "profile", label: "Profile", to: "/profile" },
];

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// App frame for the advisor side: brand, tab bar, primary action.
export default function Shell({ me, tab, children }) {
  return (
    <>
      <header className="appbar">
        <div className="appbar-inner">
          <button className="brand" onClick={() => navigate("/")}>
            {me.firm?.logo_url ? (
              <img src={me.firm.logo_url} alt={me.firm.name || "Firm logo"} />
            ) : (
              <span className="brand-mark" aria-hidden="true" />
            )}
            <span>{me.firm?.name || "Client Hubs"}</span>
          </button>
          <nav className="tabs" role="tablist">
            {TABS.map((t) => (
              <button key={t.key} role="tab" aria-selected={tab === t.key}
                className={tab === t.key ? "tab active" : "tab"} onClick={() => navigate(t.to)}>
                {t.label}
              </button>
            ))}
          </nav>
          <div className="appbar-right">
            <button className="btn btn-sm" onClick={() => navigate("/new")}>New client hub</button>
            <button className="avatar avatar-sm" title={me.profile?.name} onClick={() => navigate("/profile")}>
              {me.profile?.photo_url ? <img src={me.profile.photo_url} alt="" /> : initials(me.profile?.name)}
            </button>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
