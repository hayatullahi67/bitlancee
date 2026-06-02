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

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
const TOTAL_STEPS = 7;

const CATEGORIES = [
  "Web Development", "Mobile Development", "UI / UX Design", "Graphic Design",
  "Writing & Content", "Video & Animation", "Data Science & AI", "Blockchain & Bitcoin",
  "DevOps & Cloud", "Marketing & SEO", "Finance & Accounting", "Other",
];

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  "Web Development": ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "PostgreSQL", "GraphQL"],
  "Mobile Development": ["React Native", "Flutter", "Swift", "Kotlin", "Expo"],
  "UI / UX Design": ["Figma", "Sketch", "Prototyping", "User Research", "Wireframing"],
  "Graphic Design": ["Illustrator", "Photoshop", "Branding", "Logo Design", "Print Design"],
  "Writing & Content": ["Copywriting", "SEO Writing", "Technical Writing", "Ghostwriting", "Editing"],
  "Video & Animation": ["After Effects", "Premiere Pro", "Motion Graphics", "3D Animation"],
  "Data Science & AI": ["Python", "TensorFlow", "Machine Learning", "SQL", "Data Visualization"],
  "Blockchain & Bitcoin": ["Solidity", "Lightning Network", "Bitcoin Script", "Web3.js", "Smart Contracts"],
  "DevOps & Cloud": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
  "Marketing & SEO": ["Google Ads", "SEO", "Social Media", "Email Marketing", "Analytics"],
  "Finance & Accounting": ["Bookkeeping", "Tax Preparation", "Financial Modeling", "QuickBooks"],
  "Other": [],
};

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level", desc: "I'm relatively new to this field and building my experience." },
  { value: "intermediate", label: "Intermediate", desc: "I have solid experience and have completed several projects." },
  { value: "expert", label: "Expert", desc: "I have extensive experience and deep expertise in my field." },
];

const AVAILABILITY_OPTIONS = ["Available", "Full Time", "Part Time", "Busy / Booked"];
const RESPONSE_TIME_OPTIONS = ["Within an hour", "Within a few hours", "Within a day", "Asynchronous"];

export default function FreelancerOnboardingPage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [uid, setUid] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("Available");
  const [responseTime, setResponseTime] = useState("Within a few hours");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPublicId, setAvatarPublicId] = useState("");

  // Step 6 — Lightning wallet
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
      const snap = await getDoc(doc(firebaseDb, "freelancers", user.uid));
      const data = snap.exists() ? (snap.data() as any) : {};
      if (data.onboardingComplete) { router.replace("/freelancer/dashboard"); return; }
      setFirstName(data.firstName ?? user.displayName?.split(" ")[0] ?? "");
    });
    return () => unsub();
  }, [router]);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 15) setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  };
  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));
  const suggestions = category ? (SKILL_SUGGESTIONS[category] ?? []).filter((s) => !skills.includes(s)) : [];

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
        title, category, skills, experienceLevel, bio, hourlyRate, location, availability, responseTime,
        ...(avatarUrl ? { avatarUrl, avatarPublicId } : {}),
        ...(lightningConnection
          ? { lightningAddress: getAddressFromConnection(lightningConnection), lightningConnectorType: lightningConnection.type }
          : {}),
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(firebaseDb, "freelancers", uid), fields);
      await updateDoc(doc(firebaseDb, "all_users", uid), {
        ...(avatarUrl ? { avatarUrl, avatarPublicId } : {}),
        ...(lightningConnection
          ? { lightningAddress: getAddressFromConnection(lightningConnection), lightningConnectorType: lightningConnection.type }
          : {}),
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      });
      router.push("/freelancer/dashboard");
    } catch (err) { console.error("Failed to save onboarding:", err); setSaving(false); }
  };

  const canProceed = () => {
    if (step === 1) return title.trim().length > 0 && category.length > 0;
    if (step === 2) return skills.length > 0;
    if (step === 3) return experienceLevel.length > 0;
    if (step === 4) return bio.trim().length > 10;
    return true;
  };

  const next = () => { if (step < TOTAL_STEPS) setStep((s) => (s + 1) as Step); else handleFinish(); };
  const back = () => { if (step > 1) setStep((s) => (s - 1) as Step); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCF9F7] to-[#f5ede5] flex flex-col items-center justify-center px-4 py-10">
        <div className="flex items-center mb-[5px] gap-3">
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

          {/* Step 1 — Expertise */}
          {step === 1 && (
            <div>
              <h2 className="text-[22px] font-black text-[#1a1a1a] mb-1">What's your main expertise?</h2>
              <p className="text-[13px] text-[#888] mb-6">This helps clients find you for the right jobs.</p>
              <div className="mb-5">
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2 block">Professional Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full-Stack Bitcoin Developer" className="w-full bg-[#F9F6F2] rounded-[12px] px-4 py-3 text-[13px] text-[#1a1a1a] border border-transparent focus:outline-none focus:border-[#F7931A] transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2 block">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} type="button" onClick={() => setCategory(cat)} className={`text-left px-3 py-2.5 rounded-[10px] text-[12px] font-semibold border transition-all ${category === cat ? "bg-[#FFF3E0] border-[#F7931A] text-[#8C4F00]" : "bg-[#F9F6F2] border-transparent text-[#555] hover:border-[#F7931A]/40"}`}>{cat}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Skills */}
          {step === 2 && (
            <div>
              <h2 className="text-[22px] font-black text-[#1a1a1a] mb-1">What are your top skills?</h2>
              <p className="text-[13px] text-[#888] mb-6">Add up to 15 skills. These appear on your profile.</p>
              <div className="flex gap-2 mb-4">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }} placeholder="Type a skill and press Enter" className="flex-1 bg-[#F9F6F2] rounded-[12px] px-4 py-3 text-[13px] text-[#1a1a1a] border border-transparent focus:outline-none focus:border-[#F7931A] transition-colors" />
                <button type="button" onClick={() => addSkill(skillInput)} className="px-4 py-3 rounded-[12px] bg-[#F7931A] text-white text-[12px] font-black hover:bg-[#E07D0A] transition-colors">Add</button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {skills.map((skill) => (
                    <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF3E0] border border-[#F7931A]/30 text-[11px] font-bold text-[#8C4F00]">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-[#C8A87A] hover:text-[#8C4F00]">×</button>
                    </span>
                  ))}
                </div>
              )}
              {suggestions.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2">Suggested for {category}</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button key={s} type="button" onClick={() => addSkill(s)} className="px-3 py-1.5 rounded-full bg-[#F9F6F2] border border-[#EAE7E2] text-[11px] font-semibold text-[#555] hover:border-[#F7931A] hover:text-[#8C4F00] transition-all">+ {s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Experience */}
          {step === 3 && (
            <div>
              <h2 className="text-[22px] font-black text-[#1a1a1a] mb-1">What's your experience level?</h2>
              <p className="text-[13px] text-[#888] mb-6">This helps set client expectations.</p>
              <div className="flex flex-col gap-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button key={level.value} type="button" onClick={() => setExperienceLevel(level.value)} className={`text-left px-5 py-4 rounded-[14px] border-2 transition-all ${experienceLevel === level.value ? "border-[#F7931A] bg-[#FFF3E0]" : "border-[#EAE7E2] bg-[#F9F6F2] hover:border-[#F7931A]/40"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-black text-[#1a1a1a]">{level.label}</span>
                      {experienceLevel === level.value && <CheckCircle2 size={18} className="text-[#F7931A]" />}
                    </div>
                    <p className="text-[12px] text-[#888] mt-1">{level.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Bio + Rate */}
          {step === 4 && (
            <div>
              <h2 className="text-[22px] font-black text-[#1a1a1a] mb-1">Tell clients about yourself</h2>
              <p className="text-[13px] text-[#888] mb-6">A strong bio and clear rate attract the right clients.</p>
              <div className="mb-5">
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2 block">Professional Bio</label>
                <textarea rows={5} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Describe your background, what you do best, and how you work with clients..." className="w-full bg-[#F9F6F2] rounded-[12px] px-4 py-3 text-[13px] text-[#1a1a1a] border border-transparent focus:outline-none focus:border-[#F7931A] transition-colors resize-none" />
                <p className="text-[10px] text-[#B0A89E] mt-1 text-right">{bio.length} chars</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2 block">Hourly Rate (sats/hr)</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="e.g. 5000" min={0} className="w-40 bg-[#F9F6F2] rounded-[12px] px-4 py-3 text-[13px] text-[#1a1a1a] border border-transparent focus:outline-none focus:border-[#F7931A] transition-colors" />
                  <span className="text-[12px] font-bold text-[#B0A89E]">sats / hr</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5 — Location + Availability */}
          {step === 5 && (
            <div>
              <h2 className="text-[22px] font-black text-[#1a1a1a] mb-1">Where are you & how do you work?</h2>
              <p className="text-[13px] text-[#888] mb-6">Clients use this to find the right fit.</p>
              <div className="mb-5">
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2 block">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria or Remote" className="w-full bg-[#F9F6F2] rounded-[12px] px-4 py-3 text-[13px] text-[#1a1a1a] border border-transparent focus:outline-none focus:border-[#F7931A] transition-colors" />
              </div>
              <div className="mb-5">
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2 block">Availability</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <button key={opt} type="button" onClick={() => setAvailability(opt)} className={`px-3 py-2.5 rounded-[10px] text-[12px] font-semibold border transition-all ${availability === opt ? "bg-[#FFF3E0] border-[#F7931A] text-[#8C4F00]" : "bg-[#F9F6F2] border-transparent text-[#555] hover:border-[#F7931A]/40"}`}>{opt}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[#999] mb-2 block">Response Time</label>
                <div className="grid grid-cols-2 gap-2">
                  {RESPONSE_TIME_OPTIONS.map((opt) => (
                    <button key={opt} type="button" onClick={() => setResponseTime(opt)} className={`px-3 py-2.5 rounded-[10px] text-[12px] font-semibold border transition-all ${responseTime === opt ? "bg-[#FFF3E0] border-[#F7931A] text-[#8C4F00]" : "bg-[#F9F6F2] border-transparent text-[#555] hover:border-[#F7931A]/40"}`}>{opt}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6 — Connect Wallet */}
          {step === 6 && (
            <div>
              <h2 className="text-[22px] font-black text-[#1a1a1a] mb-1">Connect your wallet</h2>
              <p className="text-[13px] text-[#888] mb-6">Add a Lightning wallet to receive instant Bitcoin payments. You can skip this and add it later in settings.</p>

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

          {/* Step 7 — Photo */}
          {step === 7 && (
            <div>
              <h2 className="text-[22px] font-black text-[#1a1a1a] mb-1">Add a profile photo</h2>
              <p className="text-[13px] text-[#888] mb-6">Profiles with photos get significantly more views. You can always change it later.</p>
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
      <p className="mt-4 text-[11px] text-[#B0A89E]">Welcome{firstName ? `, ${firstName}` : ""}! Let's set up your profile.</p>
    </div>
  );
}
