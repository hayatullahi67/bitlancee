"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase";

type FreelancerProfile = {
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  location: string;
  memberSinceFormatted: string;
  bio: string;
  skills: string[];
  hourlyRate: string;
  currency: string;
  avatarUrl: string;
  totalEarned: string;
  jobSuccess: number;
  jobsCompleted: number;
  hoursWorked: number;
  responseTime: string;
  availability: string;
  portfolioItems: any[];
};

const EMPTY_PROFILE: FreelancerProfile = {
  firstName: "",
  lastName: "",
  fullName: "",
  title: "",
  location: "",
  memberSinceFormatted: "",
  bio: "",
  skills: [],
  hourlyRate: "0",
  currency: "SATS",
  avatarUrl: "",
  totalEarned: "-",
  jobSuccess: 0,
  jobsCompleted: 0,
  hoursWorked: 0,
  responseTime: "Response time not specified",
  availability: "Availability not specified",
  portfolioItems: [],
};

export default function FreelancerPublicProfilePage() {
  const params = useParams<{ uid: string }>();
  const uid = params?.uid ?? "";
  const [profile, setProfile] = useState<FreelancerProfile>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!uid) {
      setErrorMessage("Freelancer ID is missing.");
      setIsLoading(false);
      return;
    }

    const loadProfileData = async () => {
      try {
        console.log("Fetching profile for UID:", uid);
        const freelancerRef = doc(firebaseDb, "freelancers", uid);
        const allUsersRef = doc(firebaseDb, "all_users", uid);
        
        const [allUsersSnap, freelancerSnap] = await Promise.all([
          getDoc(allUsersRef),
          getDoc(freelancerRef),
        ]);

        if (!allUsersSnap.exists() && !freelancerSnap.exists()) {
          console.warn("No document found in freelancers or all_users for UID:", uid);
          setErrorMessage("This freelancer profile does not exist or has been removed.");
          return;
        }

        const allData = allUsersSnap.exists() ? (allUsersSnap.data() as any) : {};
        const freeData = freelancerSnap.exists() ? (freelancerSnap.data() as any) : {};

        console.log("Data fetched successfully");

        const firstName = freeData.firstName ?? allData.firstName ?? "";
        const lastName = freeData.lastName ?? allData.lastName ?? "";
        const fullName = freeData.fullName ?? allData.fullName ?? `${firstName} ${lastName}`.trim();

        // Member Since formatting
        const createdAtRaw = allData.createdAt ?? freeData.createdAt ?? null;
        let memberSinceFormatted = "April 2024";
        if (createdAtRaw) {
          const date = typeof createdAtRaw.toDate === "function" ? createdAtRaw.toDate() : new Date(createdAtRaw);
          memberSinceFormatted = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        }

        setProfile({
          firstName,
          lastName,
          fullName,
          title: freeData.title ?? "Bitcoin-Native Expert",
          location: freeData.location ?? "Remote",
          memberSinceFormatted: `Member since ${memberSinceFormatted}`,
          bio: freeData.bio ?? "No professional biography provided yet.",
          skills: Array.isArray(freeData.skills) ? freeData.skills : [],
          hourlyRate: freeData.hourlyRate ?? "0",
          currency: freeData.currency ?? "SATS",
          avatarUrl: freeData.avatarUrl ?? allData.avatarUrl ?? "",
          totalEarned: freeData.totalEarned ?? "-",
          jobSuccess: freeData.jobSuccess ?? 0,
          jobsCompleted: freeData.jobsCompleted ?? 0,
          hoursWorked: freeData.hoursWorked ?? 0,
          responseTime: freeData.responseTime ?? "Response time not specified",
          availability: freeData.availability ?? "Availability not specified",
          portfolioItems: Array.isArray(freeData.portfolioItems) ? freeData.portfolioItems : [],
        });

      } catch (err: any) {
        console.error("Critical error loading public profile:", err);
        setErrorMessage(`Error: ${err?.message || "Unable to load profile"}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [uid]);

  const router = useRouter();

  const initials = useMemo(() => {
    const name = profile.fullName || "Freelancer";
    return name.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join("");
  }, [profile.fullName]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F6F3] text-[12px] text-[#6b6762]">
        Loading profile...
      </div>
    );
  }

  if (errorMessage) {
     return (
       <div className="flex min-h-screen items-center justify-center bg-[#F7F6F3] px-4">
         <div className="rounded-[16px] border border-[#EAE7E2] bg-white p-8 text-center max-w-md">
           <div className="mb-4 text-[#8C4F00] font-bold">Profile Unavailable</div>
           <p className="text-[13px] text-[#999] mb-6">{errorMessage}</p>
           <button onClick={() => router.back()} className="inline-block px-6 py-2 bg-[#1a1a1a] text-white text-[12px] font-bold rounded-full uppercase tracking-widest">
              Go Back
           </button>
         </div>
       </div>
     );
  }

  return (
    <main className="min-h-screen bg-[#F7F6F3] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <div className="mb-8">
           <button onClick={() => router.back()} className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[12px] font-bold text-[#8C4F00] shadow-sm transition-all hover:bg-[#8C4F00] hover:text-white border border-[#EAE7E2]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Go Back
           </button>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
           <div className="flex-1 w-full bg-transparent">
              <div className="flex items-start gap-4 mb-10">
                 <div className="h-24 w-24 overflow-hidden rounded-[16px] border border-[#EAE7E2] bg-[#F1ECE5]">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[#8C4F00] font-bold text-2xl">
                        {initials}
                      </div>
                    )}
                 </div>
                 <div className="pt-2">
                    <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight">{profile.fullName}</h1>
                    <div className="text-[16px] font-medium text-[#1a1a1a] mt-2">
                       {profile.title}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[12px] text-[#999]">
                       <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {profile.location}
                       </span>
                       <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {profile.memberSinceFormatted}
                       </span>
                    </div>
                 </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 mb-12 rounded-[12px] border border-[#E0DDD8] bg-[#F1F0ED] overflow-hidden">
                 {[
                    { label: "Total Earned", value: profile.totalEarned },
                    { label: "Job Success", value: `${profile.jobSuccess}%` },
                    { label: "Jobs Completed", value: profile.jobsCompleted },
                    { label: "Hours Worked", value: profile.hoursWorked },
                 ].map((stat, i) => (
                    <div key={stat.label} className={`py-4 px-2 text-center ${i !== 3 ? 'border-r border-[#E0DDD8]' : ''}`}>
                       <div className="text-[9px] uppercase tracking-[0.1em] text-[#999] mb-1 font-bold">{stat.label}</div>
                       <div className="text-[18px] font-bold text-[#1a1a1a]">{stat.value}</div>
                    </div>
                 ))}
              </div>

              {/* Bio & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-12 border-t border-[#EAE7E2] pt-8">
                 <div>
                    <div className="mb-4">
                       <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#E8921A]">Professional Bio</span>
                    </div>
                    <p className="text-[13px] leading-[1.8] text-[#555] whitespace-pre-wrap">
                       {profile.bio}
                    </p>
                 </div>
                 <div>
                    <div className="mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#E8921A]">Core Expertise</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {profile.skills.length > 0 ? (
                          profile.skills.map(skill => (
                             <span key={skill} className="px-4 py-1.5 rounded-[6px] bg-[#EAE7E2] text-[11px] font-bold text-[#1a1a1a] uppercase tracking-wide">
                                {skill}
                             </span>
                          ))
                       ) : (
                         <span className="text-[12px] text-[#999] italic">No expertise listed yet.</span>
                       )}
                    </div>
                 </div>
              </div>

              {/* Work History */}
              <div className="mt-12 border-t border-[#EAE7E2] pt-8">
                 <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#E8921A]">Work History</span>
                 </div>
                 <div className="text-[13px] text-[#999] italic">
                    No work history yet — completed jobs will appear here.
                 </div>
              </div>

              {/* Portfolio */}
              <div className="mt-12 border-t border-[#EAE7E2] pt-8">
                 <div className="mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#E8921A]">Portfolio</span>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {profile.portfolioItems.map((item, idx) => (
                       <div key={idx} className="group rounded-[16px] border border-[#EAE7E2] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div className="aspect-[16/10] bg-[#F1ECE5] overflow-hidden">
                             {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#CCC]">No Image</div>
                             )}
                          </div>
                          <div className="p-4">
                             <h4 className="text-[14px] font-bold text-[#1a1a1a]">{item.title}</h4>
                             <p className="text-[12px] text-[#999] line-clamp-1 mt-1">{item.description}</p>
                          </div>
                       </div>
                    ))}
                    {profile.portfolioItems.length === 0 && (
                       <div className="col-span-full border border-dashed border-[#EAE7E2] rounded-[16px] p-8 text-center text-[#999] text-[13px]">
                          Portfolio items will be displayed here once added.
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Sidebar */}
           <div className="w-full lg:w-[320px] space-y-4">
              <div className="rounded-[16px] border border-[#EAE7E2] bg-white p-6 shadow-sm">
                 <div className="text-[9px] font-bold uppercase tracking-widest text-[#999] mb-4">Hourly Rate</div>
                 <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[12px] font-bold text-[#999]">SATS</span>
                    <span className="text-[36px] font-bold text-[#1a1a1a] tracking-tighter">{profile.hourlyRate}</span>
                    <span className="text-[12px] text-[#999]">/hr</span>
                 </div>
              </div>

              <div className="space-y-2">
                 <Link href={`/client/dashboard/messages?chat=${uid}`} className="block w-full py-4 rounded-[12px] bg-gradient-to-r from-orange-600 to-orange-500 text-center text-[12px] font-bold text-white uppercase tracking-[0.1em] shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                    Hire Now
                 </Link>
                 <button className="w-full py-4 rounded-[12px] bg-[#EAE7E2] text-[#333] text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-[#E0DDD8] transition-all">
                    Invite to Job
                 </button>
              </div>

              <div className="rounded-[16px] border border-[#EAE7E2] bg-white p-6 shadow-sm space-y-6">
                 <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-[#999] mb-2">Response Time</div>
                    <div className="text-[12px] text-[#999]">{profile.responseTime}</div>
                 </div>
                 <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-[#999] mb-2">Availability</div>
                    <div className="text-[12px] text-[#999]">{profile.availability}</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
