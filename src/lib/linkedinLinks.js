// LinkedIn links for the built-in example clients, kept in this browser only
// (real clients store theirs on the hub via the hubs function).
const KEY = "clienthub_linkedin_links";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function exampleLink(id) {
  return read()[id] || "";
}

export function setExampleLink(id, url) {
  try {
    const all = read();
    if (url) all[id] = url;
    else delete all[id];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage blocked: the link lasts for this visit only.
  }
}

// Same rule as the server: a linkedin.com/in/<slug> profile, with or without https://.
export function isLinkedInProfile(value) {
  const s = value.trim();
  if (!s) return false;
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return /(^|\.)linkedin\.com$/i.test(u.hostname) && /^\/in\/[A-Za-z0-9\-_%]{2,100}\/?$/.test(u.pathname);
  } catch {
    return false;
  }
}
