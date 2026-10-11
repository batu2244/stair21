// deno-lint-ignore-file no-explicit-any
import { createClientFromRequest } from "npm:@base44/sdk";

// LinkedIn insights for a client profile: scrape the public profile with Bright
// Data, then have the AI turn it into short talking points for the advisor.
// Results are cached by URL (LinkedInBrief) so each profile is scraped at most
// once a week; a manual refresh is allowed every 10 minutes.
// Needs the BRIGHTDATA_API_KEY secret (npx base44 secrets set).

const DATASET = "gd_l1viktl72bvl7bjuj0"; // Bright Data: LinkedIn people profiles
const FRESH_MS = 7 * 24 * 3600 * 1000;
const REFRESH_COOLDOWN_MS = 10 * 60 * 1000;

const BRIEF_SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string", description: "One sentence: who they are and what they do now" },
    bullets: {
      type: "array",
      items: { type: "string" },
      description: "4 to 6 short talking points, one fact each",
    },
  },
  required: ["headline", "bullets"],
};

const json = (data: unknown, status = 200) => Response.json(data, { status });
const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Accept linkedin.com/in/<slug> on any subdomain; return one canonical form.
function canonical(raw: string) {
  try {
    const u = new URL(raw);
    const m = u.pathname.match(/^\/in\/([A-Za-z0-9\-_%]{2,100})\/?$/);
    if (u.protocol !== "https:" || !/(^|\.)linkedin\.com$/.test(u.hostname) || !m) return "";
    return `https://www.linkedin.com/in/${m[1].toLowerCase()}/`;
  } catch {
    return "";
  }
}

// Only the fields worth summarizing, trimmed so the prompt stays small.
function digest(p: any) {
  const cut = (s: unknown, n: number) => (typeof s === "string" ? s.slice(0, n) : undefined);
  return {
    name: p.name,
    location: p.city || p.location,
    position: p.position,
    about: cut(p.about, 1200),
    current_company: p.current_company?.name || p.current_company_name,
    experience: (p.experience || []).slice(0, 6).map((e: any) => ({
      title: e.title, company: e.company, start: e.start_date, end: e.end_date, about: cut(e.description, 300),
    })),
    education: (p.education || []).filter((e: any) => e.title).map((e: any) => ({ school: e.title, start: e.start_year, end: e.end_year })),
    honors: p.honors_and_awards,
    followers: p.followers,
    recent_posts: (p.activity || []).slice(0, 8).map((a: any) => cut(a.title, 300)),
  };
}

function promptFor(d: any) {
  return `You help a wealth advisor prepare for a call with a client or prospect. Below is the person's public LinkedIn profile.

PROFILE (the only facts you may use):
${JSON.stringify(d, null, 2)}

WRITE:
- headline: one plain sentence on who they are and what they do now.
- bullets: 4 to 6 short talking points an advisor can use: current role and company, career moves, education, notable wins or news, and what they post about. One fact per bullet, under 25 words.

RULES:
- Use only facts in the profile. Never guess income, net worth, family or health.
- No sales language and no advice. Plain, friendly English.`;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const body = await req.json();

    // Same no-login scoping as the hubs function: only set-up advisors may scrape.
    const owner_key = str(body.ownerKey, 100);
    if (owner_key.length < 20) return json({ error: "Invalid key" }, 400);
    const profile = (await db.AdvisorProfile.filter({ owner_key }, "-created_date", 1))[0];
    if (!profile) return json({ error: "Set up your profile first" }, 403);

    if (body.action !== "brief") return json({ error: "Unknown action" }, 400);
    const url = canonical(str(body.url, 300));
    if (!url) return json({ error: "That isn't a LinkedIn profile link" }, 400);

    const now = Date.now();
    let row: any = (await db.LinkedInBrief.filter({ url }, "-created_date", 1))[0] || null;
    const age = row?.fetched_at ? now - new Date(row.fetched_at).getTime() : Infinity;
    const out = (r: any) => json({ brief: { url, status: r.status, name: r.name, headline: r.headline, bullets: r.bullets || [], fetched_at: r.fetched_at, error: r.error } });

    if (row?.status === "ready" && (body.force ? age < REFRESH_COOLDOWN_MS : age < FRESH_MS)) return out(row);

    const key = Deno.env.get("BRIGHTDATA_API_KEY");
    if (!key) return json({ error: "LinkedIn isn't connected yet. Add the BRIGHTDATA_API_KEY secret." }, 503);
    const auth = { Authorization: `Bearer ${key}` };

    // Get the scraped profile: finish a running snapshot, or scrape now.
    let scraped: any = null;
    if (row?.status === "pending" && row.snapshot_id) {
      const r = await fetch(`https://api.brightdata.com/datasets/v3/snapshot/${row.snapshot_id}?format=json`, { headers: auth });
      if (r.status === 202) return out(row); // still running
      if (r.ok) scraped = await r.json();
    }
    if (!scraped) {
      const r = await fetch(
        `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${DATASET}&notify=false&include_errors=true`,
        {
          method: "POST",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify({ input: [{ url }], limit_per_input: null }),
          signal: AbortSignal.timeout(100_000),
        },
      );
      if (!r.ok) {
        console.error("Bright Data error", r.status, (await r.text()).slice(0, 300));
        return json({ error: r.status === 401 ? "The Bright Data key was rejected." : "Couldn't reach LinkedIn right now. Try again soon." }, 502);
      }
      scraped = await r.json();
    }

    // Long scrapes come back as a snapshot id; save it and let the page poll.
    if (scraped && !Array.isArray(scraped) && scraped.snapshot_id) {
      const data = { url, status: "pending", snapshot_id: scraped.snapshot_id, requested_at: new Date(now).toISOString() };
      row = row ? await db.LinkedInBrief.update(row.id, data) : await db.LinkedInBrief.create(data);
      return out({ ...row, ...data });
    }

    const person = Array.isArray(scraped) ? scraped[0] : scraped;
    if (!person || person.error || !person.name) {
      const data = { url, status: "failed", error: "LinkedIn didn't return this profile. It may be private.", fetched_at: new Date(now).toISOString() };
      row = row ? await db.LinkedInBrief.update(row.id, data) : await db.LinkedInBrief.create(data);
      return out({ ...row, ...data });
    }

    let written: any;
    try {
      written = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: promptFor(digest(person)),
        response_json_schema: BRIEF_SCHEMA,
      });
    } catch (err) {
      console.error("AI brief failed:", (err as Error)?.message);
      return json({ error: "The AI couldn't write the summary. Please try again." }, 503);
    }

    const data = {
      url,
      status: "ready",
      snapshot_id: "",
      error: "",
      name: str(person.name, 200),
      headline: str(written?.headline, 300),
      bullets: (Array.isArray(written?.bullets) ? written.bullets : []).map((b: unknown) => str(b, 300)).filter(Boolean).slice(0, 6),
      fetched_at: new Date(now).toISOString(),
    };
    row = row ? await db.LinkedInBrief.update(row.id, data) : await db.LinkedInBrief.create(data);
    return out({ ...row, ...data });
  } catch (err) {
    console.error("linkedin function failed:", (err as Error)?.message);
    return json({ error: "Something went wrong" }, 500);
  }
}
