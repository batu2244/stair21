import { useEffect, useState } from "react";
import { hubs } from "@/lib/api";
import { usePath } from "@/lib/router";
import Shell from "@/components/Shell";
import Hubs from "@/pages/Hubs";
import FollowUps from "@/pages/FollowUps";
import Create from "@/pages/Create";
import HubDetail from "@/pages/HubDetail";
import Snapshot from "@/pages/Snapshot";
import Profile from "@/pages/Profile";
import Firm from "@/pages/Firm";
import ClientView from "@/pages/ClientView";

// Advisor side: no login. Asks for a profile the first time.
function Workspace({ path, notify }) {
  const [me, setMe] = useState(undefined);

  useEffect(() => {
    hubs("me")
      .then(setMe)
      .catch(() => setMe({ error: true }));
  }, []);

  if (me === undefined) return <div className="spinner" />;
  if (me.error) return <main className="screen"><p className="muted">Couldn't load. Please refresh.</p></main>;

  const onProfile = (profile) => setMe((m) => ({ ...m, profile }));
  const onFirm = (firm) => setMe((m) => ({ ...m, firm }));

  // First visit: profile setup, without the app frame.
  if (!me.profile) return <Profile me={me} onSaved={onProfile} />;

  let tab = "dashboard";
  let page;
  const snap = path.match(/^\/hubs\/([^/]+)\/v\/(\d+)$/);
  const hub = path.match(/^\/hubs\/([^/]+)$/);
  if (path === "/profile") [tab, page] = ["profile", <Profile me={me} onSaved={onProfile} />];
  else if (path === "/firm") [tab, page] = ["firm", <Firm me={me} onSaved={onFirm} notify={notify} />];
  else if (path === "/hubs") [tab, page] = ["hubs", <Hubs />];
  else if (path === "/new") [tab, page] = ["dashboard", <Create />];
  else if (snap) [tab, page] = ["hubs", <Snapshot key={path} id={snap[1]} version={snap[2]} />];
  else if (hub) [tab, page] = ["hubs", <HubDetail key={hub[1]} id={hub[1]} me={me} notify={notify} />];
  // Dashboard is the follow-up manager; /follow-ups kept so old links still work.
  else page = <FollowUps me={me} notify={notify} />;

  return <Shell me={me} tab={tab}>{page}</Shell>;
}

export default function App() {
  const path = usePath();
  const [toast, setToast] = useState("");

  const notify = (msg) => {
    setToast(msg);
    clearTimeout(notify.t);
    notify.t = setTimeout(() => setToast(""), 2400);
  };

  const client = path.match(/^\/c\/([^/]+)$/);
  return (
    <>
      {client ? <ClientView key={client[1]} token={client[1]} /> : <Workspace path={path} notify={notify} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
