"use client";

/**
 * OneSignal Integration — SDK-free approach
 *
 * Instead of using the react-onesignal browser SDK (which requires exact domain
 * matching in the OneSignal dashboard), we use OneSignal's REST API directly.
 *
 * Flow:
 * 1. User visits the site — OneSignal's web push SDK is loaded via a <script> tag
 *    on the OneSignal dashboard side (through their CDN service worker).
 *    We use the OneSignal Web SDK v16 push subscription directly.
 * 2. We call OneSignal.init() then link the Firebase UID as the external user ID.
 * 3. When sending notifications, we target by external_id (Firebase UID) — no
 *    need to store or look up oneSignalId at all.
 */

import { useEffect } from "react";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ?? "";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(onesignal: any) => void>;
    OneSignal?: any;
  }
}

let initStarted = false;

async function saveSubscriptionId(uid: string, subscriptionId: string) {
  try {
    await setDoc(
      doc(firebaseDb, "all_users", uid),
      { oneSignalId: subscriptionId, oneSignalLinked: true, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.error("[OneSignal] Firestore save error:", err);
  }
}

export default function OneSignalInit() {
  useEffect(() => {
    if (typeof window === "undefined" || !APP_ID || initStarted) return;
    initStarted = true;

    // Load OneSignal SDK script dynamically
    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    script.onload = () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          await OneSignal.init({
            appId: APP_ID,
            allowLocalhostAsSecureOrigin: true,
          });

          // Link Firebase UID as external user ID for targeting
          const user = firebaseAuth.currentUser;
          if (user) {
            await OneSignal.login(user.uid);

            // Save subscription ID to Firestore
            const subId = OneSignal.User?.PushSubscription?.id;
            if (subId) {
              await saveSubscriptionId(user.uid, subId);
            }

            // Watch for future subscription changes
            OneSignal.User?.PushSubscription?.addEventListener?.("change", async (event: any) => {
              const id = event?.current?.id;
              if (id) await saveSubscriptionId(user.uid, id);
            });
          }
        } catch (err: any) {
          // Init failed — likely domain not configured in OneSignal dashboard.
          // This is non-fatal. Add localhost:3000 to allowed origins in OneSignal settings.
          if (process.env.NODE_ENV !== "production") {
            console.warn("[OneSignal] init failed — add localhost:3000 to allowed origins in OneSignal dashboard:", err?.message ?? err);
          }
        }
      });
    };
    document.head.appendChild(script);

    // Also link UID when auth state changes (e.g., user logs in after SDK loads)
    const unsub = firebaseAuth.onAuthStateChanged(async (user) => {
      if (!user || !window.OneSignal) return;
      try {
        await window.OneSignal.login(user.uid);
        const subId = window.OneSignal.User?.PushSubscription?.id;
        if (subId) await saveSubscriptionId(user.uid, subId);
      } catch {
        // OneSignal not ready yet — will be handled by onload callback
      }
    });

    return () => unsub();
  }, []);

  return null;
}

export async function requestOneSignalPermission(): Promise<{ ok: boolean }> {
  if (typeof window === "undefined") return { ok: false };
  try {
    await window.OneSignal?.Notifications?.requestPermission?.();
    const user = firebaseAuth.currentUser;
    if (user) {
      await window.OneSignal?.login?.(user.uid);
      const subId = window.OneSignal?.User?.PushSubscription?.id;
      if (subId) await saveSubscriptionId(user.uid, subId);
    }
    return { ok: true };
  } catch (err) {
    console.error("[OneSignal] permission error:", err);
    return { ok: false };
  }
}
