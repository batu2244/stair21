import { base44 } from "@/api/base44Client";

// No login: this browser's random key identifies the advisor's data.
const KEY = "clienthubs_owner_key";
let memoryKey = null;

function ownerKey() {
  try {
    let key = localStorage.getItem(KEY);
    if (!key) {
      key = crypto.randomUUID() + crypto.randomUUID();
      localStorage.setItem(KEY, key);
    }
    return key;
  } catch {
    // Storage blocked: keep a key for this visit only.
    memoryKey ||= crypto.randomUUID() + crypto.randomUUID();
    return memoryKey;
  }
}

// Advisor and reviewer actions (see base44/functions/hubs). Throws with the
// server's message on failure.
export async function hubs(action, params = {}) {
  try {
    const res = await base44.functions.invoke("hubs", { action, ownerKey: ownerKey(), ...params });
    return res.data;
  } catch (err) {
    const e = new Error(err?.response?.data?.error || "Something went wrong");
    e.status = err?.response?.status;
    throw e;
  }
}

// LinkedIn insights for a profile URL (see base44/functions/linkedin).
export async function linkedinBrief(url, force = false) {
  try {
    const res = await base44.functions.invoke("linkedin", { action: "brief", ownerKey: ownerKey(), url, force });
    return res.data.brief;
  } catch (err) {
    const e = new Error(err?.response?.data?.error || "Something went wrong");
    e.status = err?.response?.status;
    throw e;
  }
}

// Public client view by link token (see base44/functions/client-hub).
export async function clientHub(action, token) {
  try {
    const res = await base44.functions.invoke("client-hub", { action, token });
    return res.data;
  } catch (err) {
    const e = new Error(err?.response?.data?.error || "unavailable");
    e.status = err?.response?.status;
    throw e;
  }
}

export const STATUS = {
  draft: "Draft",
  approved: "Approved",
};
