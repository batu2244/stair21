// Which built-in example clients were confirmed in this visit. Examples aren't
// in the database, so this lives in memory (and the session, to survive a reload).
const KEY = "clienthub_confirmed_examples";
let confirmed = null;

function load() {
  if (confirmed) return confirmed;
  try {
    confirmed = new Set(JSON.parse(sessionStorage.getItem(KEY) || "[]"));
  } catch {
    confirmed = new Set();
  }
  return confirmed;
}

export function isExampleConfirmed(id) {
  return load().has(id);
}

export function confirmExample(id) {
  load().add(id);
  try {
    sessionStorage.setItem(KEY, JSON.stringify([...confirmed]));
  } catch {
    /* in-memory only */
  }
}
