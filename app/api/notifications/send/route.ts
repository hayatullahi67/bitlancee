import { NextResponse } from "next/server";

type NotificationRequest = {
  userId?: string;
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
};

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID ?? process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ?? "";
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY ?? "";
const FIREBASE_WEB_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyCr_rWHnm0w79J63dm69DEMkjawulE5Ovk";

// ── Verify sender's Firebase ID token ────────────────────────────────────────
async function getRequesterUid(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const idToken = authHeader.slice("Bearer ".length).trim();
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { users?: Array<{ localId?: string }> };
    return data.users?.[0]?.localId ?? null;
  } catch {
    return null;
  }
}

// ── Send via OneSignal targeting Firebase UID as external_id ─────────────────
// OneSignal.login(uid) links the subscription to the Firebase UID on the client.
// Here we target that same UID via include_aliases.external_id.
async function sendViaOneSignal(
  targetUserId: string,
  payload: { title: string; body: string; url?: string }
): Promise<{ ok: boolean; error?: string }> {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
    return { ok: false, error: "Missing ONESIGNAL_APP_ID or ONESIGNAL_API_KEY" };
  }

  const body = {
    app_id: ONESIGNAL_APP_ID,
    // Target by Firebase UID (set via OneSignal.login() on client)
    include_aliases: {
      external_id: [targetUserId],
    },
    target_channel: "push",
    headings: { en: payload.title },
    contents: { en: payload.body },
    url: payload.url || "/",
    web_url: payload.url || "/",
    chrome_web_icon: "/favicon.ico",
  };

  const res = await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      Authorization: `Key ${ONESIGNAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    console.error("[OneSignal] API error:", err);
    return { ok: false, error: JSON.stringify(err) };
  }

  return { ok: true };
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const requesterUid = await getRequesterUid(request.headers.get("authorization"));
    if (!requesterUid) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const payload = (await request.json()) as NotificationRequest;
    if (!payload.userId || !payload.title || !payload.body) {
      return NextResponse.json({ error: "Missing userId, title, or body." }, { status: 400 });
    }

    const result = await sendViaOneSignal(payload.userId, {
      title: payload.title,
      body: payload.body,
      url: payload.url,
    });

    return NextResponse.json({ ok: result.ok, sent: result.ok ? 1 : 0, error: result.error });
  } catch (error) {
    console.error("Notification send error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send notification." },
      { status: 500 }
    );
  }
}
