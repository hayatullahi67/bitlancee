"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { LightningConnect, useWalletConnect, type Connection } from "lightningconnect";
import { getAddressFromConnection, useLightningTheme } from "@/components/organisms/LightningAddressModal";
import Image from 'next/image';

type Step = 1 | 2 | 3 | 4 | 5 | 6;
const TOTAL_STEPS = 6;

const INDUSTRIES = [
  "Technology", "Finance & Fintech", "Blockchain & Bitcoin", "E-Commerce",
  "Healthcare", "Education", "Media & Entertainment", "Marketing & Advertising",
  "Real Estate", "Legal", "Non-Profit", "Other",
];

const TEAM_SIZES = ["Just me", "2–10", "11–50", "51–200", "201–500", "500+"];

const ROLE_TITLES = [
  "Founder / CEO", "CTO / Tech Lead", "Product Manager", "Hiring Manager",
  "Marketing Manager", "Operations Manager", "Freelancer / Contractor", "Other",
];

export default function ClientOnboardingPage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [uid, setUid] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [roleTitle, setRoleTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPublicId, setAvatarPublicId] = useState("");

  // Step 4 — Lightning wallet
  const [lightningConnection, setLightningConnection] = useState<Connection | null>(null);
  const { connect: connectWallet, isConnected: walletConnected, walletInfo: walletConnectedInfo, connectionType: walletConnectionType } = useWalletConnect();
  const { isDark: walletIsDark, theme: walletTheme, toggle: toggleWalletTheme } = useLightningTheme();

  // Save wallet connection when user connects via the modal
  useEffect(() => {
    if (!walletConnected || !walletConnectedInfo) return;
    const fakeConn = { type: walletConnectionType, address: walletConnectedInfo.address } as any;
    setLightningConnection(fakeConn);
  }, [walletConnected, walletConnectedInfo?.address]);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) { router.replace("/login"); return; }
      setUid(user.uid);
      const snap = await getDoc(doc(firebaseDb, "clients", user.uid));
      const data = snap.exists() ? (snap.data() as any) : {};
      if (data.onboardingComplete) { router.replace("/client/dashboard"); return; }
      setFirstName(data.firstName ?? user.displayName?.split(" ")[0] ?? "");
    });
    return () => unsub();
  }, [router]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;
    setAvatarUploading(true);
    try {
      const idToken = await firebaseAuth.currentUser?.getIdToken();
      if (!idToken) return;
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/avatar/upload", { method: "POST", headers: { Authorization: `Bearer ${idToken}` }, body: formData });
      const payload = await res.json() as { avatarUrl?: string; avatarPublicId?: string; error?: string };
      if (!res.ok || !payload.avatarUrl) throw new Error(payload.error ?? "Upload failed");
      setAvatarUrl(payload.avatarUrl);
      setAvatarPublicId(payload.avatarPublicId ?? "");
    } catch (err) { console.error("Avatar upload failed:", err); }
    finally { setAvatarUploading(false); e.target.value = ""; }
  };

  const handleFinish = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      const fields = {
        roleTitle, companyName, industry, teamSize, location, website, phone, about,
        ...(avatarUrl ? { avatarUrl, avatarPublicId } : {}),
        ...(lightningConnection
          ? { lightningAddress: getAddressFromConnection(lightningConnection), lightningConnectorType: lightningConnection.type }
          : {}),
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(firebaseDb, "clients", uid), fields);
      await updateDoc(doc(firebaseDb, "all_users", uid), {
        ...(avatarUrl ? { avatarUrl, avatarPublicId } : {}),
        ...(lightningConnection
          ? { lightningAddress: getAddressFromConnection(lightningConnection), lightningConnectorType: lightningConnection.type }
          : {}),
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      });
      router.push("/client/dashboard");
    } catch (err) { console.error("Failed to save onboarding:", err); setSaving(false); }
  };

  const canProceed = () => {
    if (step === 1) return roleTitle.length > 0;
    if (step === 2) return industry.length > 0 && teamSize.length > 0;
    if (step === 5) return about.trim().length > 10;
    return true;
  };

  const next = () => { if (step < TOTAL_STEPS) setStep((s) => (s + 1) as Step); else handleFinish(); };
  const back = () => { if (step > 1) setStep((s) => (s - 1) as Step); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCF9F7] to-[#f5ede5] flex flex-col items-center justify-center px-4 py-10">
          <div className="flex items-center gap-3 mb-[5px]">
                        <div className="w-9 h-9 overflow-hidden rounded-xl bg-[#F7931A] flex items-center justify-center shadow-md shadow-orange-200/60 flex-shrink-0">
                          <Image
                            src="/assets/logo.png"
                            alt="Bitlance Logo"
                            width={28}
                            height={28}
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-[15px] font-bold tracking-tight text-zinc-800 leading-none">Bitlance</p>
                        </div>
                      </div>

      <div className="w-full max-w-[560px] bg-white rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-[#F0EBE3] overflow-hidden">
        <div className="h-1.5 bg-[#F0EBE3]">
          <div className="h-full bg-[#F7931A] transition-all duration-500 rounded-full" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>

        <div className="px-7 pt-7 pb-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C8A87A]">Step {step} of {TOTAL_STEPS}</span>
            {step < TOTAL_STEPS && (
              <button onClick={next} className="text-[11px] font-semibold text-[#B0A89E] hover:text-[#F7931A] transition-colors">Skip for now</button>
            )}
          </div>

          {/* Step 1 — Role & Company */}
          {step === 1 && (
            <div>
              <h2 className="text-[22px] font-black text-[#1a1a1a] mb-1">Tell us about yourself</h2>
              <p className="text-[13px] text-[#888] mb-6">This helps freelancers understand who they're working with.</p>
              <div className="mb-5">
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2 block">Your Role / Title</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_TITLES.map((role) => (
                    <button key={role} type="button" onClick={() => setRoleTitle(role)} className={`text-left px-3 py-2.5 rounded-[10px] text-[12px] font-semibold border transition-all ${roleTitle === role ? "bg-[#FFF3E0] border-[#F7931A] text-[#8C4F00]" : "bg-[#F9F6F2] border-transparent text-[#555] hover:border-[#F7931A]/40"}`}>{role}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2 block">Company Name <span className="text-[#B0A89E] normal-case font-normal">(optional)</span></label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Atlas Ventures" className="w-full bg-[#F9F6F2] rounded-[12px] px-4 py-3 text-[13px] text-[#1a1a1a] border border-transparent focus:outline-none focus:border-[#F7931A] transition-colors" />
              </div>
            </div>
          )}

          {/* Step 2 — Industry & Team Size */}
          {step === 2 && (
            <div>
              <h2 className="text-[22px] font-black text-[#1a1a1a] mb-1">About your company</h2>
              <p className="text-[13px] text-[#888] mb-6">Helps freelancers understand your context.</p>
              <div className="mb-5">
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2 block">Industry</label>
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.map((ind) => (
                    <button key={ind} type="button" onClick={() => setIndustry(ind)} className={`text-left px-3 py-2.5 rounded-[10px] text-[12px] font-semibold border transition-all ${industry === ind ? "bg-[#FFF3E0] border-[#F7931A] text-[#8C4F00]" : "bg-[#F9F6F2] border-transparent text-[#555] hover:border-[#F7931A]/40"}`}>{ind}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2 block">Team Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {TEAM_SIZES.map((size) => (
                    <button key={size} type="button" onClick={() => setTeamSize(size)} className={`px-3 py-2.5 rounded-[10px] text-[12px] font-semibold border transition-all ${teamSize === size ? "bg-[#FFF3E0] border-[#F7931A] text-[#8C4F00]" : "bg-[#F9F6F2] border-transparent text-[#555] hover:border-[#F7931A]/40"}`}>{size}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Contact & Location */}
          {step === 3 && (
            <div>
              <h2 className="text-[22px] font-black text-[#1a1a1a] mb-1">Contact & location</h2>
              <p className="text-[13px] text-[#888] mb-6">All optional — add what you're comfortable sharing.</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2 block">Location</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. New York, USA or Remote" className="w-full bg-[#F9F6F2] rounded-[12px] px-4 py-3 text-[13px] text-[#1a1a1a] border border-transparent focus:outline-none focus:border-[#F7931A] transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2 block">Website</label>
                  <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourcompany.com" className="w-full bg-[#F9F6F2] rounded-[12px] px-4 py-3 text-[13px] text-[#1a1a1a] border border-transparent focus:outline-none focus:border-[#F7931A] transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2 block">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" className="w-full bg-[#F9F6F2] rounded-[12px] px-4 py-3 text-[13px] text-[#1a1a1a] border border-transparent focus:outline-none focus:border-[#F7931A] transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Connect Wallet */}
          {step === 4 && (
            <div>
              <h2 className="text-[22px] font-black text-[#1a1a1a] mb-1">Connect your wallet</h2>
              <p className="text-[13px] text-[#888] mb-6">Add a Lightning wallet to send instant Bitcoin payments to freelancers. You can skip this and add it later in settings.</p>

              {/* Always mounted — connect() opens the modal */}
              <LightningConnect theme={walletTheme} />

              {lightningConnection ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-[#2E7D32]">
                    <CheckCircle2 size={18} className="text-[#2E7D32]" />
                    Wallet connected: {getAddressFromConnection(lightningConnection)}
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={connectWallet} className="text-[11px] font-semibold text-[#F7931A] hover:underline">
                      Change wallet
                    </button>
                    <button type="button" onClick={toggleWalletTheme} title={walletIsDark ? "Switch to light mode" : "Switch to dark mode"} className="w-7 h-7 rounded-full border border-[#EAE7E2] bg-white flex items-center justify-center text-[#888] hover:border-[#F7931A] hover:text-[#F7931A] transition-all">
                      {walletIsDark ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <button type="button" onClick={connectWallet} className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F7931A] hover:bg-[#E07D0A] text-white text-[13px] font-black transition-all">
                    <span>⚡</span> Connect Wallet
                  </button>
                  <button type="button" onClick={toggleWalletTheme} title={walletIsDark ? "Switch to light mode" : "Switch to dark mode"} className="w-10 h-10 rounded-full border border-[#EAE7E2] bg-white flex items-center justify-center text-[#888] hover:border-[#F7931A] hover:text-[#F7931A] transition-all">
                    {walletIsDark ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 5 — About */}
          {step === 5 && (
            <div>
              <h2 className="text-[22px] font-black text-[#1a1a1a] mb-1">About your company</h2>
              <p className="text-[13px] text-[#888] mb-6">Tell freelancers what you do, your goals, and how you like to collaborate.</p>
              <textarea rows={7} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="We're a fintech startup building Bitcoin payment infrastructure. We value clear communication, fast iteration, and long-term partnerships..." className="w-full bg-[#F9F6F2] rounded-[12px] px-4 py-3 text-[13px] text-[#1a1a1a] border border-transparent focus:outline-none focus:border-[#F7931A] transition-colors resize-none" />
              <p className="text-[10px] text-[#B0A89E] mt-1 text-right">{about.length} chars</p>
            </div>
          )}

          {/* Step 6 — Photo */}
          {step === 6 && (
            <div>
              <h2 className="text-[22px] font-black text-[#1a1a1a] mb-1">Add a profile photo</h2>
              <p className="text-[13px] text-[#888] mb-6">A photo builds trust with freelancers. You can always change it later.</p>
              <div className="flex flex-col items-center gap-5">
                <div onClick={() => !avatarUploading && avatarInputRef.current?.click()} className="w-[120px] h-[120px] rounded-full overflow-hidden bg-[#E8E2D9] border-2 border-dashed border-[#C8A87A] cursor-pointer relative group flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-[#C8A87A]">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      <span className="text-[10px] font-bold uppercase tracking-wide">Upload</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center rounded-full">
                    {avatarUploading ? <Loader2 size={20} className="text-white animate-spin" /> : <span className="text-white text-[10px] font-bold uppercase">Change</span>}
                  </div>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} />
                <p className="text-[11px] text-[#B0A89E] text-center">JPG, PNG or WEBP · Max 2MB</p>
                {avatarUrl && (
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#2E7D32]">
                    <CheckCircle2 size={14} /> Photo uploaded successfully
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button type="button" onClick={back} className={`flex items-center gap-1.5 text-[12px] font-semibold text-[#888] hover:text-[#1a1a1a] transition-colors ${step === 1 ? "invisible" : ""}`}>
              <ChevronLeft size={16} /> Back
            </button>
            <button type="button" onClick={next} disabled={!canProceed() || saving || avatarUploading} className="flex items-center gap-2 px-7 py-3 rounded-full bg-[#F7931A] hover:bg-[#E07D0A] disabled:bg-[#F7931A]/40 text-white text-[13px] font-black uppercase tracking-wide transition-all">
              {saving ? (<><Loader2 size={14} className="animate-spin" /> Saving...</>) : step === TOTAL_STEPS ? (<>Go to Dashboard <ChevronRight size={16} /></>) : (<>Continue <ChevronRight size={16} /></>)}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-300 ${i + 1 === step ? "w-5 h-2 bg-[#F7931A]" : i + 1 < step ? "w-2 h-2 bg-[#F7931A]/50" : "w-2 h-2 bg-[#DDD8D0]"}`} />
        ))}
      </div>
      <p className="mt-4 text-[11px] text-[#B0A89E]">Welcome{firstName ? `, ${firstName}` : ""}! Let's set up your account.</p>
    </div>
  );
}
