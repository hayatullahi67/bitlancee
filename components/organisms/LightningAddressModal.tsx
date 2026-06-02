"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LightningConnect, useWalletConnect, type Connection } from "lightningconnect";
import { firebaseDb } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// ─── Theme definitions ────────────────────────────────────────────────────────
const DARK_THEME = {
  primary: "#F7931A",
  background: "#0A0A0A",
  foreground: "#F5F5F5",
  border: "#262626",
  radius: "14px",
  muted: "#A1A1AA",
};

const LIGHT_THEME = {
  primary: "#F7931A",
  background: "#FFFFFF",
  foreground: "#1a1a1a",
  border: "#EAE7E2",
  radius: "14px",
  muted: "#9e9690",
};

const MODE_KEY = "lightningconnect:mode";

export type { Connection };

// ─── Helper: extract a display address from any Connection type ───────────────
export function getAddressFromConnection(connection: Connection): string {
  if (connection.type === "blink-address") return connection.address;
  if (connection.type === "blink-api") return connection.walletName || "Blink API Key";
  if (connection.type === "nwc") return connection.connectionString;
  return "";
}

// ─── ConnectorBadge ───────────────────────────────────────────────────────────
export function ConnectorBadge({ connectorType }: { connectorType: string }) {
  const map: Record<string, { label: string; color: string }> = {
    "blink-address": { label: "⚡ Blink Address", color: "bg-[#F7931A]/15 text-[#F7931A] border-[#F7931A]/30" },
    "blink-api":     { label: "🔑 Blink API",     color: "bg-[#8b5cf6]/15 text-[#8b5cf6] border-[#8b5cf6]/30" },
    "nwc":           { label: "🔗 NWC",            color: "bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30" },
  };
  const info = map[connectorType] ?? { label: connectorType, color: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${info.color}`}>
      {info.label}
    </span>
  );
}

// ─── useLightningTheme — persisted light/dark preference ─────────────────────
export function useLightningTheme() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY);
      if (saved === "light") setIsDark(false);
      else if (saved === "dark") setIsDark(true);
    } catch {}
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      try { localStorage.setItem(MODE_KEY, next ? "dark" : "light"); } catch {}
      return next;
    });
  };

  return { isDark, theme: isDark ? DARK_THEME : LIGHT_THEME, toggle };
}

// ─── Sun icon ─────────────────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

// ─── Moon icon ────────────────────────────────────────────────────────────────
function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

// ─── ModalThemeToggle ─────────────────────────────────────────────────────────
// Watches for the package's modal to appear in the DOM, hides the ? button,
// and injects our sun/moon toggle in its exact place via a portal.
function ModalThemeToggle({ isDark, toggle }: { isDark: boolean; toggle: () => void }) {
  const [questionBtn, setQuestionBtn] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const overlay = document.querySelector('[style*="z-index: 9999"]');
      if (!overlay) { setQuestionBtn(null); return; }

      const buttons = Array.from(overlay.querySelectorAll("button")) as HTMLButtonElement[];
      const qBtn = buttons.find((b) => b.textContent?.trim() === "?");
      if (qBtn && qBtn !== questionBtn) {
        // Completely hide the ? button
        qBtn.style.display = "none";
        setQuestionBtn(qBtn);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [questionBtn]);

  if (!questionBtn?.parentElement) return null;

  return createPortal(
    <button
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: `1px solid ${isDark ? "#444" : "#ccc"}`,
        background: isDark ? "#1a1a1a" : "#f5f5f5",
        color: isDark ? "#F5F5F5" : "#555",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>,
    questionBtn.parentElement
  );
}

// ─── LightningWalletButton ────────────────────────────────────────────────────
type Props = {
  uid: string;
  collection: "freelancers" | "clients";
  lightningAddress: string;
  lightningConnectorType: string;
  onSaved: (address: string, connectorType: string) => void;
};

export function LightningWalletButton({
  uid,
  collection,
  lightningAddress,
  lightningConnectorType,
  onSaved,
}: Props) {
  const { isDark, theme, toggle } = useLightningTheme();
  const { connect, isConnected, walletInfo, connectionType } = useWalletConnect();

  // Save to Firebase when user connects
  useEffect(() => {
    if (!isConnected || !walletInfo || !uid) return;
    const address = walletInfo.address;
    const connectorType = connectionType ?? "";
    const payload = {
      lightningAddress: address,
      lightningConnectorType: connectorType,
      updatedAt: serverTimestamp(),
    };
    setDoc(doc(firebaseDb, collection, uid), payload, { merge: true }).catch(console.error);
    setDoc(doc(firebaseDb, "all_users", uid), payload, { merge: true }).catch(console.error);
    onSaved(address, connectorType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, walletInfo?.address]);

  const displayAddress = lightningAddress || (isConnected && walletInfo?.address) || "";
  const displayType = lightningConnectorType || connectionType || "";

  return (
    <>
      {/* Always mounted — manages its own modal open/close */}
      <LightningConnect theme={theme} />

      {/* Injects sun/moon toggle into the modal's ? button slot */}
      <ModalThemeToggle isDark={isDark} toggle={toggle} />

      {displayAddress ? (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F9F6F2] border border-[#EAE7E2]">
          <div className="min-w-0">
            <ConnectorBadge connectorType={displayType} />
            <p className="mt-1.5 text-[12px] font-medium text-[#1a1a1a] truncate">{displayAddress}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Toggle also available outside the modal */}
            <button
              onClick={toggle}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="w-7 h-7 rounded-full border border-[#EAE7E2] bg-white flex items-center justify-center text-[#888] hover:border-[#F7931A] hover:text-[#F7931A] transition-all"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={connect}
              className="px-3 py-1.5 rounded-lg border border-[#EAE7E2] bg-white text-[11px] font-semibold text-[#555] hover:border-[#F7931A] hover:text-[#F7931A] transition-all"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={connect}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F7931A] hover:bg-[#E07D0A] text-white text-[12px] font-bold transition-all"
          >
            <span>⚡</span> Connect Wallet
          </button>
          <button
            onClick={toggle}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-9 h-9 rounded-xl border border-[#EAE7E2] bg-white flex items-center justify-center text-[#888] hover:border-[#F7931A] hover:text-[#F7931A] transition-all"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      )}
    </>
  );
}

export default LightningWalletButton;
