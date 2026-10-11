// deno-lint-ignore-file no-explicit-any
import { createClientFromRequest } from "npm:@base44/sdk";

// Everything advisors and reviewers do. There is no login: each browser holds a
// random owner key and every record is scoped to it here. Entities deny direct
// access, so this function is the only way to read or change hubs.

const HUB_SCHEMA = {
  type: "object",
  properties: {
    first_name: { type: "string" },
    goals: { type: "array", items: { type: "string" }, description: "The client's goals, one short line each" },
    plan_summary: { type: "string", description: "3 to 4 short sentences" },
    recap: { type: "string", description: "Exactly 2 short sentences" },
    steps: { type: "array", items: { type: "string" }, description: "2 to 4 short checklist items" },
    readings: {
      type: "array",
      description: "Exactly 2 short explainers",
      items: {
        type: "object",
        properties: { title: { type: "string" }, body: { type: "string" } },
        required: ["title", "body"],
      },
    },
  },
  required: ["first_name", "goals", "plan_summary", "recap", "steps", "readings"],
};

function promptFor(i: { client_name: string; goals_input: string; meeting_notes: string; next_step: string }) {
  return `You are drafting a client hub: a short personal web page a wealth manager shares with an existing client. It is the plain-language story on top of their financial plan: "here's your plan and why". The advisor and a compliance reviewer will check it before the client sees it.

INPUTS (the only facts you may use):
- Client name: ${i.client_name}
- Goals (one per line):
${i.goals_input || "(not given separately: take them from the meeting notes)"}
- Meeting notes:
${i.meeting_notes}
- What happens next: ${i.next_step || "(not given separately: take it from the meeting notes)"}

WRITE:
- first_name: the client's first name.
- goals: the client's goals as stated in the inputs, one short plain line each (1 to 4). Never invent a goal that isn't there.
- plan_summary: "Your plan, in plain words". 3 to 4 short sentences that explain the approach discussed in the notes and why it fits the goals. Only what the notes say.
- recap: "What we talked about". Exactly 2 short sentences addressed to the client as "you".
- steps: "Your next steps". 1 to 4 short checklist items that come from "What happens next" or the notes. If the notes name no next step, write one: "We will be in touch to set up our next conversation."
- readings: "Worth reading". Exactly 2 short general explainers of concepts named in the inputs. Plain title, 2–3 sentence body, general terms only.

RULES:
- Explain and recap only. Never recommend a security, fund or product, and never add actions that are not in the inputs.
- Never state or predict performance, returns, growth or outcomes. No guarantees.
- Leave out all account numbers, balances, dollar amounts and percentages, even if they appear in the notes. Those belong in the client's secure portal.
- No testimonials or endorsements.
- Never invent facts about the client.
- Short sentences. Plain words. Explain any unavoidable term in the same sentence. Warm, calm tone. No exclamation marks.`;
}

// Wording the SEC Marketing Rule, Reg S-P and firm policy care about. Flags are
// shown to the reviewer and archived with the approved version.
const CHECKS: [RegExp, string][] = [
  [/\b\d[\d -]{5,}\d\b/, "Possible account number or ID"],
  [/\$\s?\d|\b\d[\d,.]*\s?(k|m|mm|million|thousand|dollars)\b/i, "Dollar amount"],
  [/\d+(\.\d+)?\s?%|\bpercent\b/i, "Percentage (possible performance figure)"],
  [/\bguarantee(d|s)?\b|\brisk[- ]free\b|\bcan(no|')t lose\b/i, "Guarantee language"],
  [/\b(will|going to)\s+(grow|earn|return|double|beat|outperform)\b|\boutperform/i, "Performance prediction"],
  [/\b(you should|we recommend|recommend that you)\s+(buy|sell|invest)/i, "Investment recommendation"],
  [/\btestimonial|\breview(s|ed)? (from|by) (a |our )?client/i, "Testimonial"],
];

function scan(content: any): string[] {
  const text = [
    content.first_name,
    ...(content.goals || []),
    content.plan_summary,
    content.recap,
    ...(content.steps || []),
    content.advisor_note,
    ...(content.readings || []).flatMap((r: any) => [r.title, r.body]),
  ].filter(Boolean).join("\n");
  return CHECKS.filter(([re]) => re.test(text)).map(([, label]) => label);
}

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, n: number, max = 300) =>
  Array.isArray(v) ? v.map((s) => str(s, max)).filter(Boolean).slice(0, n) : [];

// A LinkedIn profile link in one canonical form, or "" if it isn't one.
function linkedinUrl(v: unknown) {
  let s = str(v, 300);
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    const m = u.pathname.match(/^\/in\/([A-Za-z0-9\-_%]{2,100})\/?$/);
    if (!/(^|\.)linkedin\.com$/i.test(u.hostname) || !m) return "";
    return `https://www.linkedin.com/in/${m[1].toLowerCase()}/`;
  } catch {
    return "";
  }
}

function safeUrl(v: unknown) {
  const s = str(v, 500);
  return /^https?:\/\//i.test(s) ? s : "";
}

// Template slots the advisor may edit.
function slots(patch: any) {
  const out: Record<string, unknown> = {};
  if ("first_name" in patch) out.first_name = str(patch.first_name, 100);
  if ("goals" in patch) out.goals = list(patch.goals, 8);
  if ("plan_summary" in patch) out.plan_summary = str(patch.plan_summary);
  if ("recap" in patch) out.recap = str(patch.recap);
  if ("steps" in patch) out.steps = list(patch.steps, 10, 500);
  if ("advisor_note" in patch) out.advisor_note = str(patch.advisor_note, 1500);
  if ("portal_url" in patch) out.portal_url = safeUrl(patch.portal_url);
  if (Array.isArray(patch.readings)) {
    out.readings = patch.readings.slice(0, 2).map((r: any) => ({ title: str(r?.title, 200), body: str(r?.body) }));
  }
  return out;
}

function isoDate(v: unknown) {
  if (typeof v !== "string" || !v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const json = (data: unknown, status = 200) => Response.json(data, { status });

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const body = await req.json();
    const owner_key = str(body.ownerKey, 100);
    if (owner_key.length < 20) return json({ error: "Invalid key" }, 400);

    const getFirm = async () => (await db.Firm.filter({ owner_key }, "-created_date", 1))[0] || null;
    const getProfile = async () => (await db.AdvisorProfile.filter({ owner_key }, "-created_date", 1))[0] || null;
    const clean = (r: any) => {
      if (!r) return r;
      const { owner_key: _k, ...rest } = r;
      return rest;
    };

    if (body.action === "me") {
      const [profile, firm] = await Promise.all([getProfile(), getFirm()]);
      return json({ profile: clean(profile), firm: clean(firm) });
    }

    if (body.action === "saveProfile") {
      const data = {
        name: str(body.profile?.name, 120),
        title: str(body.profile?.title, 120),
        photo_url: safeUrl(body.profile?.photo_url),
      };
      if (!data.name) return json({ error: "Name is required" }, 400);
      const existing = await getProfile();
      const profile = existing
        ? await db.AdvisorProfile.update(existing.id, data)
        : await db.AdvisorProfile.create({ ...data, owner_key });
      return json({ profile: clean({ ...existing, ...profile, ...data }) });
    }

    // ---- Everything below needs a profile ----
    const profile = await getProfile();
    if (!profile) return json({ error: "Set up your profile first" }, 400);

    const log = (hub_id: string, action: string, detail = "", actor = profile.name) =>
      db.Activity.create({ hub_id, action, actor, detail });
    const loadHub = async (id: unknown) => {
      if (typeof id !== "string" || !id) return null;
      const hub = await db.ClientHub.get(id).catch(() => null);
      return hub && hub.owner_key === owner_key && !hub.archived ? hub : null;
    };
    const notFound = () => json({ error: "Not found" }, 404);

    switch (body.action) {
      case "saveFirm": {
        const days = Math.round(Number(body.firm?.link_expiry_days));
        const data = {
          name: str(body.firm?.name, 200),
          logo_url: safeUrl(body.firm?.logo_url),
          portal_url: safeUrl(body.firm?.portal_url),
          disclosure: str(body.firm?.disclosure, 3000),
          link_expiry_days: Number.isFinite(days) ? Math.min(365, Math.max(1, days)) : 30,
        };
        const existing = await getFirm();
        const firm = existing ? await db.Firm.update(existing.id, data) : await db.Firm.create({ ...data, owner_key });
        return json({ firm: clean({ ...existing, ...firm, ...data }) });
      }

      case "listHubs": {
        const hubs = (await db.ClientHub.filter({ owner_key }, "-updated_date", 500)).filter((h: any) => !h.archived);
        return json({
          hubs: hubs.map((h: any) => ({
            id: h.id,
            client_name: h.client_name,
            status: h.status,
            live_version: h.live_version || 0,
            meeting_confirmed: h.meeting_confirmed,
            next_meeting_at: h.next_meeting_at || "",
            follow_up_note: h.follow_up_note || "",
            last_contact_at: h.last_contact_at || "",
            compliance_flags: h.compliance_flags || [],
            updated_date: h.updated_date,
          })),
        });
      }

      case "getHub": {
        const hub = await loadHub(body.hubId);
        if (!hub) return notFound();
        const [snapshots, links, activity] = await Promise.all([
          db.HubSnapshot.filter({ hub_id: hub.id }, "-version", 100),
          db.ShareLink.filter({ hub_id: hub.id }, "-created_date", 100),
          db.Activity.filter({ hub_id: hub.id }, "-created_date", 100),
        ]);
        return json({
          hub: clean(hub),
          versions: snapshots.map((s: any) => ({ version: s.version, approved_by: s.approved_by, approved_at: s.approved_at })),
          links: links.map(({ token_hash: _t, ...l }: any) => l),
          activity,
        });
      }

      case "getSnapshot": {
        const hub = await loadHub(body.hubId);
        if (!hub) return notFound();
        const [snap] = await db.HubSnapshot.filter({ hub_id: hub.id, version: Number(body.version) }, "-version", 1);
        return snap ? json({ snapshot: snap }) : notFound();
      }

      case "createHub": {
        const inputs = {
          client_name: str(body.client_name, 200),
          goals_input: str(body.goals_input, 1500),
          meeting_notes: str(body.meeting_notes, 6000),
          next_step: str(body.next_step, 500),
        };
        // Only the name and notes are required; the AI takes goals and next steps from the notes.
        if (!inputs.client_name || !inputs.meeting_notes) {
          return json({ error: "Add the client's name and your notes" }, 400);
        }
        const firm = await getFirm();
        let written: any;
        try {
          written = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: promptFor(inputs),
            response_json_schema: HUB_SCHEMA,
          });
        } catch (err) {
          // The local dev backend blocks AI calls; they only work on the deployed app.
          const blocked = /blocked from direct app-runtime/i.test((err as Error)?.message || "");
          console.error("AI draft failed:", (err as Error)?.message);
          return json({ error: blocked
            ? "AI drafting only works on the live app, not on localhost."
            : "The AI couldn't write the draft. Please try again." }, 503);
        }
        const content = slots(written || {});
        const hub = await db.ClientHub.create({
          ...inputs,
          ...content,
          advisor_note: "",
          portal_url: firm?.portal_url || "",
          owner_key,
          advisor_name: profile.name,
          next_meeting_at: isoDate(body.next_meeting_at),
          linkedin_url: linkedinUrl(body.linkedin_url),
          follow_up_note: "",
          status: "draft",
          compliance_flags: scan(content),
          live_version: 0,
        });
        await log(hub.id, "Draft created", "AI draft from meeting notes");
        return json({ hub: clean(hub) });
      }

      case "updateHub": {
        const hub = await loadHub(body.hubId);
        if (!hub) return notFound();
        if (hub.status !== "draft") return json({ error: "Only drafts can be edited" }, 409);
        const patch = slots(body.patch || {});
        const flags = scan({ ...hub, ...patch });
        await db.ClientHub.update(hub.id, { ...patch, compliance_flags: flags });
        return json({ compliance_flags: flags });
      }

      case "approveHub": {
        // Compliance sign-off: the reviewer's name is archived with the version.
        const hub = await loadHub(body.hubId);
        if (!hub) return notFound();
        if (hub.status !== "draft") return json({ error: "Not a draft" }, 409);
        const reviewer = str(body.reviewer, 120);
        if (!reviewer) return json({ error: "Enter the reviewer's name" }, 400);
        if (body.attested !== true) return json({ error: "Confirm the compliance review" }, 400);

        const firm = await getFirm();
        const version = (hub.live_version || 0) + 1;
        const approved_at = new Date().toISOString();
        // Exactly what the client will see, frozen.
        const content = {
          client_name: hub.client_name,
          first_name: hub.first_name,
          goals: hub.goals || [],
          plan_summary: hub.plan_summary,
          recap: hub.recap,
          steps: hub.steps || [],
          advisor_note: hub.advisor_note || "",
          readings: hub.readings || [],
          portal_url: hub.portal_url || "",
          advisor_name: profile.name,
          advisor_title: profile.title || "",
          advisor_photo_url: profile.photo_url || "",
          firm_name: firm?.name || "",
          firm_logo_url: firm?.logo_url || "",
          disclosure: firm?.disclosure || "",
        };
        const flags = scan(hub);
        await db.HubSnapshot.create({
          hub_id: hub.id,
          version,
          content,
          compliance_flags: flags,
          advisor_name: profile.name,
          approved_by: reviewer,
          approved_at,
        });
        await db.ClientHub.update(hub.id, { status: "approved", live_version: version, compliance_flags: flags });
        await log(
          hub.id,
          `Approved version ${version}`,
          flags.length ? `Approved with flags: ${flags.join(", ")}` : "Compliance review confirmed",
          reviewer,
        );
        return json({ success: true, version });
      }

      case "setFollowUp": {
        const hub = await loadHub(body.hubId);
        if (!hub) return notFound();
        const next_meeting_at = isoDate(body.next_meeting_at);
        const follow_up_note = str(body.follow_up_note, 300);
        const moved = next_meeting_at !== (hub.next_meeting_at || "");
        // Marking a follow-up done records the contact; the meeting time if it has
        // passed, otherwise now.
        let last_contact_at: string | undefined;
        if (body.completed === true) {
          const held = hub.next_meeting_at && new Date(hub.next_meeting_at) < new Date();
          last_contact_at = held ? hub.next_meeting_at : new Date().toISOString();
          await log(hub.id, "Follow-up completed", hub.follow_up_note || "");
        }
        await db.ClientHub.update(hub.id, {
          next_meeting_at,
          follow_up_note,
          ...(last_contact_at ? { last_contact_at } : {}),
          // A new date needs a new confirmation from the client.
          ...(moved ? { meeting_confirmed: false } : {}),
        });
        if (moved && next_meeting_at) await log(hub.id, "Follow-up scheduled", next_meeting_at);
        if (moved && !next_meeting_at && !last_contact_at) await log(hub.id, "Follow-up cleared");
        return json({ success: true, last_contact_at: last_contact_at || hub.last_contact_at || "" });
      }

      case "confirmMeeting": {
        // The advisor confirms on the client's behalf (e.g. they confirmed by phone).
        const hub = await loadHub(body.hubId);
        if (!hub) return notFound();
        if (!hub.next_meeting_at) return json({ error: "Schedule a follow-up first" }, 409);
        if (!hub.meeting_confirmed) {
          await db.ClientHub.update(hub.id, { meeting_confirmed: true, meeting_confirmed_at: new Date().toISOString() });
          await log(hub.id, "Meeting confirmed by advisor", hub.next_meeting_at);
        }
        return json({ success: true });
      }

      case "setLinkedIn": {
        // Add, change or clear the client's LinkedIn link.
        const hub = await loadHub(body.hubId);
        if (!hub) return notFound();
        const linkedin_url = linkedinUrl(body.linkedin_url);
        if (str(body.linkedin_url) && !linkedin_url) return json({ error: "That isn't a LinkedIn profile link" }, 400);
        await db.ClientHub.update(hub.id, { linkedin_url });
        await log(hub.id, linkedin_url ? "LinkedIn link saved" : "LinkedIn link removed", linkedin_url);
        return json({ linkedin_url });
      }

      case "archiveHub": {
        // Hide the client and switch off its share links. Approved versions and the
        // activity log are kept for books and records.
        const hub = await loadHub(body.hubId);
        if (!hub) return notFound();
        const links = await db.ShareLink.filter({ hub_id: hub.id }, "-created_date", 100);
        await Promise.all(links.filter((l: any) => !l.revoked).map((l: any) => db.ShareLink.update(l.id, { revoked: true })));
        await db.ClientHub.update(hub.id, { archived: true, archived_at: new Date().toISOString() });
        await log(hub.id, "Client archived", "Share links revoked; approved versions kept");
        return json({ success: true });
      }

      case "newVersion": {
        // Start editing again. The last approved version stays live until the next approval.
        const hub = await loadHub(body.hubId);
        if (!hub) return notFound();
        if (hub.status !== "approved") return json({ error: "Not approved" }, 409);
        await db.ClientHub.update(hub.id, { status: "draft" });
        await log(hub.id, "Started a new version", `Version ${hub.live_version} stays live`);
        return json({ success: true });
      }

      case "createLink": {
        const hub = await loadHub(body.hubId);
        if (!hub) return notFound();
        if (!hub.live_version) return json({ error: "Approve the hub first" }, 409);
        const firm = await getFirm();
        const days = firm?.link_expiry_days || 30;
        const token = newToken();
        const expires_at = new Date(Date.now() + days * 86400000).toISOString();
        await db.ShareLink.create({
          hub_id: hub.id,
          token_hash: await sha256(token),
          expires_at,
          revoked: false,
          created_by: profile.name,
          open_count: 0,
        });
        await log(hub.id, "Share link created", `Expires ${expires_at.slice(0, 10)}`);
        // The raw token is returned once and never stored.
        return json({ token, expires_at });
      }

      case "revokeLink": {
        const link = await db.ShareLink.get(str(body.linkId, 100)).catch(() => null);
        if (!link || !(await loadHub(link.hub_id))) return notFound();
        await db.ShareLink.update(link.id, { revoked: true });
        await log(link.hub_id, "Share link revoked");
        return json({ success: true });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (err) {
    console.error("hubs failed:", (err as Error)?.message);
    return json({ error: "Something went wrong" }, 500);
  }
}
