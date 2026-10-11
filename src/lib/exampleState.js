import { EXAMPLE_FOLLOW_UPS } from "@/lib/example";
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

// Built-in examples the advisor deleted. Kept in this browser only.
const HIDDEN_KEY = "clienthub_hidden_examples";
let hidden = null;

function loadHidden() {
  if (hidden) return hidden;
  try {
    hidden = new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]"));
  } catch {
    hidden = new Set();
  }
  return hidden;
}

export function hideExample(id) {
  loadHidden().add(id);
  try {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden]));
  } catch {
    /* in-memory only */
  }
}

export function visibleExamples() {
  const h = loadHidden();
  return EXAMPLE_FOLLOW_UPS.filter((c) => !h.has(c.id));
}
