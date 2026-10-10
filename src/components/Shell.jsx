import { useEffect, useRef, useState } from "react";
import { navigate } from "@/lib/router";
import "@/components/ProfileMenu.css";

const TABS = [
  { key: "dashboard", label: "Dashboard", to: "/" },
  { key: "hubs", label: "Client hubs", to: "/hubs" },
  { key: "followups", label: "Follow-ups", to: "/follow-ups" },
];

// Settings that live behind the avatar instead of the tab bar.
const MENU = [
  { key: "profile", label: "Profile", to: "/profile" },
  { key: "firm", label: "Firm", to: "/firm" },
];

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// Avatar button that opens a small menu with Profile and Firm.
function ProfileMenu({ me, tab }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (to) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <div className="profile-menu" ref={ref}>
      <button className={open ? "avatar avatar-sm open" : "avatar avatar-sm"} title={me.profile?.name}
        aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {me.profile?.photo_url ? <img src={me.profile.photo_url} alt="" /> : initials(me.profile?.name)}
      </button>
      {open && (
        <div className="profile-menu-panel" role="menu">
          <div className="profile-menu-head">
            <div className="profile-menu-name">{me.profile?.name}</div>
            {me.firm?.name && <div className="profile-menu-sub">{me.firm.name}</div>}
          </div>
          {MENU.map((m) => (
            <button key={m.key} role="menuitem" className={tab === m.key ? "profile-menu-item active" : "profile-menu-item"}
              onClick={() => go(m.to)}>
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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
            <ProfileMenu me={me} tab={tab} />
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
