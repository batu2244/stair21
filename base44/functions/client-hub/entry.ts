// deno-lint-ignore-file no-explicit-any
import { createClientFromRequest } from "npm:@base44/sdk";

// Public: clients open their hub with an expiring, revocable link token.
// They always see the last approved snapshot, never the working draft.

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const json = (data: unknown, status = 200) => Response.json(data, { status });

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const { action, token } = await req.json();
    if (typeof token !== "string" || token.length < 20 || token.length > 100) {
      return json({ error: "unavailable" }, 404);
    }

    const [link] = await db.ShareLink.filter({ token_hash: await sha256(token) }, "-created_date", 1);
    if (!link) return json({ error: "unavailable" }, 404);
    if (link.revoked || new Date(link.expires_at).getTime() < Date.now()) {
      return json({ error: "expired" }, 410);
    }

    const hub = await db.ClientHub.get(link.hub_id).catch(() => null);
    if (!hub?.live_version || hub.archived) return json({ error: "unavailable" }, 404);

    if (action === "confirm") {
      if (!hub.meeting_confirmed) {
        await db.ClientHub.update(hub.id, { meeting_confirmed: true, meeting_confirmed_at: new Date().toISOString() });
        await db.Activity.create({ hub_id: hub.id, action: "Client confirmed next meeting", actor: "client" });
      }
      return json({ success: true });
    }

    const [snap] = await db.HubSnapshot.filter({ hub_id: hub.id, version: hub.live_version }, "-version", 1);
    if (!snap) return json({ error: "unavailable" }, 404);

    const first = !link.open_count;
    await db.ShareLink.update(link.id, {
      open_count: (link.open_count || 0) + 1,
      last_opened_at: new Date().toISOString(),
    });
    if (first) await db.Activity.create({ hub_id: hub.id, action: "Client opened the hub", actor: "client" });

    return json({
      hub: {
        ...snap.content,
        version: snap.version,
        approved_at: snap.approved_at,
        meeting_confirmed: !!hub.meeting_confirmed,
        // Live from the hub, not the snapshot: the date can move after approval.
        next_meeting_at: hub.next_meeting_at || "",
      },
    });
  } catch (err) {
    console.error("client-hub failed:", (err as Error)?.message);
    return json({ error: "unavailable" }, 500);
  }
}
