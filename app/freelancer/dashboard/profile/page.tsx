"use client";

import { useEffect, useState } from "react";
import FreelancerSidebar from "@/components/molecules/FreelancerSidebar";
import Button from "@/components/atoms/Button";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

interface WorkHistory {
  title: string;
  amount: string;
  status: "COMPLETED" | "IN_PROGRESS";
  rating: number;
  review: string;
  period: string;
}

interface PortfolioItem {
  id: number;
  label: string;
  bgClass: string;
}

interface FreelancerProfileProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  name?: string;
  title?: string;
  location?: string;
  memberSince?: string;
  avatarUrl?: string;
  verified?: boolean;
  hourlyRate?: string;
  currency?: string;
  totalEarned?: string;
  jobSuccess?: number;
  jobsCompleted?: number;
  hoursWorked?: number;
  bio?: string;
  skills?: string[];
  responseTime?: string;
  availability?: string;
  lastActive?: string;
  workHistory?: WorkHistory[];
  portfolioItems?: PortfolioItem[];
  performanceData?: number[];
}

const DEFAULT_PROFILE: FreelancerProfileProps = {
  firstName: "Satoshi",
  lastName: "Nakamoto",
  email: "satoshi@bitlance.com",
  name: "Satoshi Nakamoto",
  title: "Senior Rust & Lightning Engineer",
  location: "Cyberspace / Tokyo",
  memberSince: "2009",
  avatarUrl: undefined,
  verified: true,
  hourlyRate: "150,000",
  currency: "sats/hr",
  totalEarned: "2,000,048",
  jobSuccess: 100,
  jobsCompleted: 42,
  hoursWorked: 1840,
  bio: `Specializing in the intersection of high-performance systems and decentralized finance. My expertise lies in building mission-critical infrastructure for the Bitcoin ecosystem using Rust and the Lightning Network protocol.\n\nI have contributed to major open-source Bitcoin implementations and designed custom L2 solutions for institutional-grade payments. I focus on code immutability, cryptographic security, and low-latency execution.`,
  skills: ["Rust", "Lightning Network", "Cryptography", "LND", "Bitcoin Core", "WASM", "Zero Knowledge"],
  responseTime: "Under 4 hours",
  availability: "30 hrs/week",
  lastActive: "12 mins ago",
  workHistory: [
    {
      title: "LDK Integration for Global Fintech",
      amount: "500,000 sats",
      status: "COMPLETED",
      rating: 5,
      review:
        "Absolute professional. Satoshi delivered the rust-lightning integration ahead of schedule with zero security vulnerabilities during audit.",
      period: "Oct 2023 - Jan 2024",
    },
    {
      title: "Custom Lightning Node Dashboard",
      amount: "1,200,000 sats",
      status: "COMPLETED",
      rating: 5,
      review: "Highest quality engineering. The UI is clean and the backend handling of sats flows is flawless.",
      period: "Aug 2023 - Sep 2023",
    },
  ],
  portfolioItems: [
    { id: 1, label: "Node Graph", bgClass: "bg-[#0d0d0d]" },
    { id: 2, label: "Trading Dashboard", bgClass: "bg-[#0a0a1a]" },
  ],
  performanceData: [30, 45, 55, 40, 60, 70, 90, 75, 85, 95],
};



// const dmMono = DM_Mono({
//   subsets: ["latin"],
//   weight: ["300", "400", "500"],
//   display: "swap",
// });

const BAR_HEIGHTS = [
  "h-[6px]",
  "h-[10px]",
  "h-[14px]",
  "h-[18px]",
  "h-[22px]",
  "h-[26px]",
  "h-[30px]",
  "h-[34px]",
  "h-[38px]",
  "h-[42px]",
  "h-[46px]",
  "h-[48px]",
] as const;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={i <= rating ? "#F5A623" : "#D1D0CE"}
          className="block"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span className={` ml-[3px] text-[12px] font-semibold text-[#F5A623]`}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function LedgerPerformance({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const peakIndex = data.indexOf(max);

  return (
    <div className="rounded-[10px] bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] px-4 py-[14px]">
      <div
        className={` mb-3 text-[9px] font-medium uppercase tracking-[0.12em] text-[#888]`}
      >
        Ledger Performance
      </div>
      <div className="relative flex h-[56px] items-end gap-[4px]">
        {data.map((val, i) => {
          const isPeak = i === peakIndex;
          const idx = Math.round((val / max) * (BAR_HEIGHTS.length - 1));
          const heightClass = BAR_HEIGHTS[Math.min(Math.max(idx, 0), BAR_HEIGHTS.length - 1)];
          return (
            <div key={i} className="relative flex flex-col items-center">
              {isPeak && (
                <div
                  className={` absolute -top-[18px] whitespace-nowrap rounded-[3px] bg-[#F5A623] px-[5px] py-[1px] text-[8px] font-bold tracking-[0.05em] text-black`}
                >
                  PEAK
                </div>
              )}
              <div
                className={[
                  "w-[14px] rounded-t-[2px]",
                  heightClass,
                  isPeak
                    ? "bg-gradient-to-b from-[#F5A623] to-[#E8921A]"
                    : "bg-[rgba(245,166,35,0.22)]",
                ].join(" ")}
              />
            </div>
          );
        })}
      </div>
      <div className={` mt-2 text-[8px] leading-[1.5] text-[#555]`}>
        Top 1% Engineering Performance index: high reliability in mission-critical Rust deployments.
      </div>
    </div>
  );
}

function SkillTag({ label }: { label: string }) {
  return (
    <span
      className={` inline-block   bg-[#EAE7E7] px-3 py-[5px] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#3a3a3a]`}
    >
      {label}
    </span>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<FreelancerProfileProps>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const {
    firstName,
    lastName,
    email,
    name,
    title,
    location,
    memberSince,
    avatarUrl,
    verified,
    hourlyRate,
    currency,
    totalEarned,
    jobSuccess,
    jobsCompleted,
    hoursWorked,
    bio,
    skills,
    responseTime,
    availability,
    lastActive,
    workHistory,
    portfolioItems,
    performanceData,
  } = profile;

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      if (!user) return;
      try {
        const allUsersSnap = await getDoc(doc(firebaseDb, "all_users", user.uid));
        const freelancerSnap = await getDoc(doc(firebaseDb, "freelancers", user.uid));
        const allData = allUsersSnap.exists() ? (allUsersSnap.data() as any) : {};
        const freeData = freelancerSnap.exists() ? (freelancerSnap.data() as any) : {};
        const fName = allData.firstName ?? DEFAULT_PROFILE.firstName ?? "";
        const lName = allData.lastName ?? DEFAULT_PROFILE.lastName ?? "";
        const fallbackName = `${fName} ${lName}`.trim();
        const fullName = allData.fullName ?? (fallbackName || DEFAULT_PROFILE.name);

        setProfile((prev) => ({
          ...prev,
          firstName: fName,
          lastName: lName,
          email: allData.email ?? user.email ?? prev.email,
          name: fullName,
          title: freeData.title ?? prev.title,
          location: freeData.location ?? prev.location,
          bio: freeData.bio ?? prev.bio,
          skills: Array.isArray(freeData.skills) ? freeData.skills : prev.skills,
          hourlyRate: freeData.hourlyRate ?? prev.hourlyRate,
          availability: freeData.availability ?? prev.availability,
          responseTime: freeData.responseTime ?? prev.responseTime,
        }));
      } catch {
        // keep defaults
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    const user = firebaseAuth.currentUser;
    if (!user) return;
    if (!firstName?.trim() || !lastName?.trim()) return;
    setIsSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updateDoc(doc(firebaseDb, "all_users", user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(firebaseDb, "freelancers", user.uid), {
        title: title ?? "",
        location: location ?? "",
        bio: bio ?? "",
        skills: skills ?? [],
        hourlyRate: hourlyRate ?? "",
        availability: availability ?? "",
        responseTime: responseTime ?? "",
        updatedAt: serverTimestamp(),
      });
      setProfile((prev) => ({ ...prev, name: fullName }));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className={`min-h-screen bg-[#F7F6F3] `}>
      <div className="flex">
        <FreelancerSidebar active="/freelancer/dashboard/profile" />

        <div className="flex-1 lg:ml-0">
          <div className="min-h-screen overflow-y-auto pt-4 md:pt-0">
            <div className="w-full px-4 max-md:pt-10 sm:px-6 lg:px-2 md:pt-5 ">
              <div className="w-full flex justify-end gap-2 px-5 pb-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
                {isEditing ? (
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                ) : null}
              </div>
              <div className=" w-full flex flex-col items-start gap-6   p-5   lg:flex-row">
                <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
                  {isEditing ? (
                    <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-4">
                      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
                        Edit Profile
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-[0.12em] text-[#9e9690]">
                            First Name
                          </label>
                          <input
                            value={firstName ?? ""}
                            onChange={(e) =>
                              setProfile((prev) => ({ ...prev, firstName: e.target.value }))
                            }
                            className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-[0.12em] text-[#9e9690]">
                            Last Name
                          </label>
                          <input
                            value={lastName ?? ""}
                            onChange={(e) =>
                              setProfile((prev) => ({ ...prev, lastName: e.target.value }))
                            }
                            className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-[0.12em] text-[#9e9690]">
                            Professional Title
                          </label>
                          <input
                            value={title ?? ""}
                            onChange={(e) =>
                              setProfile((prev) => ({ ...prev, title: e.target.value }))
                            }
                            className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-[0.12em] text-[#9e9690]">
                            Location
                          </label>
                          <input
                            value={location ?? ""}
                            onChange={(e) =>
                              setProfile((prev) => ({ ...prev, location: e.target.value }))
                            }
                            className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-[0.12em] text-[#9e9690]">
                            Hourly Rate
                          </label>
                          <input
                            value={hourlyRate ?? ""}
                            onChange={(e) =>
                              setProfile((prev) => ({ ...prev, hourlyRate: e.target.value }))
                            }
                            className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-[0.12em] text-[#9e9690]">
                            Availability
                          </label>
                          <input
                            value={availability ?? ""}
                            onChange={(e) =>
                              setProfile((prev) => ({ ...prev, availability: e.target.value }))
                            }
                            className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="text-[10px] uppercase tracking-[0.12em] text-[#9e9690]">
                            Response Time
                          </label>
                          <input
                            value={responseTime ?? ""}
                            onChange={(e) =>
                              setProfile((prev) => ({ ...prev, responseTime: e.target.value }))
                            }
                            className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="text-[10px] uppercase tracking-[0.12em] text-[#9e9690]">
                            Bio
                          </label>
                          <textarea
                            rows={4}
                            value={bio ?? ""}
                            onChange={(e) =>
                              setProfile((prev) => ({ ...prev, bio: e.target.value }))
                            }
                            className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="text-[10px] uppercase tracking-[0.12em] text-[#9e9690]">
                            Skills
                          </label>
                          <div className="rounded-lg border border-[#EAE7E2] px-3 py-2">
                            <input
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                  e.preventDefault();
                                  const cleaned = skillInput.trim().replace(/,$/, "");
                                  if (!cleaned) return;
                                  setProfile((prev) => ({
                                    ...prev,
                                    skills: prev.skills?.includes(cleaned)
                                      ? prev.skills
                                      : [...(prev.skills ?? []), cleaned],
                                  }));
                                  setSkillInput("");
                                }
                                if (e.key === "Backspace" && !skillInput && (skills?.length ?? 0) > 0) {
                                  setProfile((prev) => ({
                                    ...prev,
                                    skills: (prev.skills ?? []).slice(0, -1),
                                  }));
                                }
                              }}
                              className="w-full bg-transparent text-[12px] focus:outline-none"
                              placeholder="Type a skill and press Enter"
                            />
                            {skills?.length ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#F6F3F1] px-3 py-1 text-[10px] font-semibold uppercase text-[#666]"
                                  >
                                    {skill}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setProfile((prev) => ({
                                          ...prev,
                                          skills: (prev.skills ?? []).filter((s) => s !== skill),
                                        }))
                                      }
                                      className="text-[#9e9690] hover:text-[#1a1a1a]"
                                      aria-label={`Remove ${skill}`}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <p className="text-[10px] text-[#9e9690]">Press Enter or comma to add a skill.</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start">
                      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#EAE7E2] bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a]">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-[28px] text-[#888]">BTC</div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h1 className="truncate text-[22px] font-semibold tracking-[-0.02em] text-[#1a1a1a] sm:text-[26px]">
                            {name}
                          </h1>
                          {verified && (
                            <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
                              <circle cx="12" cy="12" r="10" fill="#1D9BF0" />
                              <path
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7 13l3 3 7-7"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="mt-[3px] text-[13px] italic text-[#666] sm:text-[14px]">{title}</div>
                        <div className={` mt-2 flex flex-wrap gap-3 text-[11px] text-[#888] sm:gap-4`}>
                          <span className="flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {location}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Member since {memberSince}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-y-4 rounded-[10px] border border-[#E0DDD8] bg-[#F0EDE8] px-4 py-3 sm:mt-10 sm:grid-cols-4 lg:mt-[70px]">
                      {[
                        { label: "Total Earned", value: totalEarned, unit: "sats" },
                        { label: "Job Success", value: `${jobSuccess}`, unit: "%" },
                        { label: "Jobs Completed", value: `${jobsCompleted}` },
                        { label: "Hours Worked", value: hoursWorked.toLocaleString() },
                      ].map((stat, i) => (
                        <div
                          key={stat.label}
                          className={[
                            "px-2 text-center",
                            i < 3 ? "sm:border-r sm:border-[#D8D5D0]" : "",
                          ].join(" ")}
                        >
                          <div
                            className={` mb-1 text-[9px] uppercase tracking-[0.1em] text-[#999]`}
                          >
                            {stat.label}
                          </div>
                          <div
                            className={` text-[15px] font-semibold tracking-[-0.02em] text-[black]`}
                          >
                            {stat.value}
                            {stat.unit && <span className="ml-[2px] text-[10px] text-[#aaa]">{stat.unit}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="border-t border-[#EAE7E2]" />

                  <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
                    <div>
                      <div
                        className={` mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[#F5A623]`}
                      >
                        Professional Bio
                      </div>
                      {bio.split("\n\n").map((para, i, arr) => (
                        <p
                          key={i}
                          className={`text-[13px] leading-[1.75] text-[#555] ${
                            i < arr.length - 1 ? "mb-3" : ""
                          }`}
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                    <div>
                      <div
                        className={` mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[#F5A623]`}
                      >
                        Core Expertise
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s) => (
                          <SkillTag key={s} label={s} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <hr className="border-t border-[#EAE7E2]" />

                  <div>
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div
                        className={` text-[10px] font-medium uppercase tracking-[0.14em] text-[#F5A623]`}
                      >
                        Work History
                      </div>
                      <span className={` text-[11px] text-[#aaa]`}>
                        Showing latest {workHistory.length} of {jobsCompleted}
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {workHistory.map((job, i) => (
                        <div
                          key={i}
                          className="rounded-[10px] border border-[#EAE7E2] bg-white px-4 py-4 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]"
                        >
                          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <span className="text-[15px] font-medium text-[#1a1a1a]">{job.title}</span>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={` text-[12px] text-[#555]`}>{job.amount}</span>
                              <span
                                className={[
                                  "rounded-[4px] px-[9px] py-[3px] text-[10px] font-medium uppercase tracking-[0.1em]",
                                  job.status === "COMPLETED"
                                    ? "bg-[#E6F4EA] text-[#2E7D32]"
                                    : "bg-[#E8F0FE] text-[#1565C0]",
                                ].join(" ")}
                              >
                                {job.status === "COMPLETED" ? "Completed" : "In Progress"}
                              </span>
                            </div>
                          </div>
                          <StarRating rating={job.rating} />
                          <p className="mt-2 text-[12px] italic leading-[1.65] text-[#666]">"{job.review}"</p>
                          <div className={` mt-2 text-[10px] text-[#bbb]`}>{job.period}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="border-t border-[#EAE7E2]" />

                  <div>
                    <div
                      className={` mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[#F5A623]`}
                    >
                      Portfolio
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {portfolioItems.map((item) => (
                        <div
                          key={item.id}
                          className={[
                            "aspect-[16/9] overflow-hidden rounded-lg border border-[#EAE7E2] transition-all hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
                            item.bgClass,
                          ].join(" ")}
                        >
                          {item.id === 1 ? (
                            <svg viewBox="0 0 200 120" className="block h-full w-full">
                              <defs>
                                <radialGradient id="fpg1" cx="50%" cy="50%" r="50%">
                                  <stop offset="0%" stopColor="#F5A623" stopOpacity="0.35" />
                                  <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
                                </radialGradient>
                              </defs>
                              <rect width="200" height="120" fill="#0d0d0d" />
                              <circle cx="100" cy="60" r="52" fill="url(#fpg1)" />
                              {(
                                [
                                  [100, 18],
                                  [142, 44],
                                  [132, 82],
                                  [68, 82],
                                  [58, 44],
                                  [100, 60],
                                ] as [number, number][]
                              ).flatMap(([x, y], i, arr) =>
                                arr.slice(i + 1).map(([x2, y2], j) => (
                                  <line
                                    key={`${i}-${j}`}
                                    x1={x}
                                    y1={y}
                                    x2={x2}
                                    y2={y2}
                                    stroke="#F5A623"
                                    strokeWidth="0.7"
                                    strokeOpacity="0.45"
                                  />
                                ))
                              )}
                              {(
                                [
                                  [100, 18],
                                  [142, 44],
                                  [132, 82],
                                  [68, 82],
                                  [58, 44],
                                  [100, 60],
                                ] as [number, number][]
                              ).map(([x, y], i) => (
                                <circle key={i} cx={x} cy={y} r="3.5" fill="#F5A623" />
                              ))}
                            </svg>
                          ) : (
                            <svg viewBox="0 0 200 120" className="block h-full w-full">
                              <rect width="200" height="120" fill="#0a0a1a" />
                              {Array.from({ length: 38 }).map((_, i) => {
                                const x = (i / 37) * 176 + 12;
                                const h = 18 + Math.sin(i * 0.75) * 14 + Math.sin(i * 0.28) * 9;
                                return (
                                  <rect
                                    key={i}
                                    x={x - 1.8}
                                    y={82 - h}
                                    width="3.5"
                                    height={h}
                                    fill={i % 6 === 0 ? "#F5A623" : "#2a2a4a"}
                                    opacity={0.75}
                                  />
                                );
                              })}
                              <polyline
                                points={Array.from({ length: 38 })
                                  .map((_, i) => `${(i / 37) * 176 + 12},${54 + Math.sin(i * 0.48) * 18}`)
                                  .join(" ")}
                                fill="none"
                                stroke="#F5A623"
                                strokeWidth="1.5"
                                opacity="0.85"
                              />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-shrink-0 flex-col gap-4 lg:w-[296px]">
                  
                  <div className="bg-white py-[20px] px-[20px]">
                  
                  <div>
                    <div
                      className={` mb-1 text-[9px] uppercase tracking-[0.12em] text-[#999]`}
                    >
                      Hourly Rate
                    </div>
                    <div
                      className={` text-[24px] font-bold tracking-[-0.03em] text-[#1a1a1a] sm:text-[26px]`}
                    >
                      {hourlyRate}
                      <span className="ml-[3px] text-[13px] font-normal text-[#888]">{currency}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button className={` w-full rounded-lg bg-gradient-to-r from-orange-600 to-orange-400 px-3 py-3 text-[13px] font-medium uppercase tracking-[0.06em] text-white transition-all hover:opacity-90 hover:-translate-y-[1px]`}>
                      Hire Now
                    </button>
                    <button className={` w-full rounded-lg   px-3 py-[11px] text-[13px] font-medium uppercase tracking-[0.06em] text-[#3a3a3a] transition-all hover:border-[#F5A623] bg-[#EAE7E7]`}>
                      Invite to Job
                    </button>
                  </div>

                   <div className="flex mt-[20px] flex-col gap-3">
                    {[
                      { label: "Response Time", value: responseTime },
                      { label: "Availability", value: availability },
                      { label: "Last Active", value: lastActive },
                    ].map((row) => (
                      <div key={row.label} className="flex flex-col gap-[2px]">
                        <span
                          className={` text-[9px] uppercase tracking-[0.1em] text-[#aaa]`}
                        >
                          {row.label}
                        </span>
                        <span className={` text-[12px] font-medium text-[#3a3a3a]`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  </div>

                 

                  <LedgerPerformance data={performanceData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
