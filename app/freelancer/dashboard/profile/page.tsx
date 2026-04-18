// "use client";

// import { useEffect, useState } from "react";
// import FreelancerSidebar from "@/components/molecules/FreelancerSidebar";
// import Button from "@/components/atoms/Button";
// import { firebaseAuth, firebaseDb } from "@/lib/firebase";
// import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

// interface WorkHistory {
//   title: string;
//   amount: string;
//   status: "COMPLETED" | "IN_PROGRESS";
//   rating: number;
//   review: string;
//   period: string;
// }

// interface PortfolioItem {
//   id: number;
//   label: string;
//   bgClass: string;
// }

// interface FreelancerProfileProps {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   name?: string;
//   title?: string;
//   location?: string;
//   memberSince?: string;
//   avatarUrl?: string;
//   verified?: boolean;
//   hourlyRate?: string;
//   currency?: string;
//   totalEarned?: string;
//   jobSuccess?: number;
//   jobsCompleted?: number;
//   hoursWorked?: number;
//   bio?: string;
//   skills?: string[];
//   responseTime?: string;
//   availability?: string;
//   lastActive?: string;
//   workHistory?: WorkHistory[];
//   portfolioItems?: PortfolioItem[];
//   performanceData?: number[];
// }

// const DEFAULT_PROFILE: FreelancerProfileProps = {
//   firstName: "Add your first name",
//   lastName: "Add your last name",
//   email: "",
//   name: "Add your full name",
//   title: "Add your professional title",
//   location: "Add your location",
//   memberSince: "",
//   avatarUrl: undefined,
//   verified: false,
//   hourlyRate: "Add your hourly rate",
//   currency: "USD",
//   totalEarned: "",
//   jobSuccess: 0,
//   jobsCompleted: 0,
//   hoursWorked: 0,
//   bio: "Add your professional bio",
//   skills: [],
//   responseTime: "Add your response time",
//   availability: "Add your availability",
//   lastActive: "",
//   workHistory: [],
//   portfolioItems: [],
//   performanceData: [],
// };



// // const dmMono = DM_Mono({
// //   subsets: ["latin"],
// //   weight: ["300", "400", "500"],
// //   display: "swap",
// // });

// const BAR_HEIGHTS = [
//   "h-[6px]",
//   "h-[10px]",
//   "h-[14px]",
//   "h-[18px]",
//   "h-[22px]",
//   "h-[26px]",
//   "h-[30px]",
//   "h-[34px]",
//   "h-[38px]",
//   "h-[42px]",
//   "h-[46px]",
//   "h-[48px]",
// ] as const;

// function StarRating({ rating }: { rating: number }) {
//   return (
//     <div className="flex items-center gap-[2px]">
//       {[1, 2, 3, 4, 5].map((i) => (
//         <svg
//           key={i}
//           width="13"
//           height="13"
//           viewBox="0 0 24 24"
//           fill={i <= rating ? "#F5A623" : "#D1D0CE"}
//           className="block"
//         >
//           <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
//         </svg>
//       ))}
//       <span className={` ml-[3px] text-[12px] font-semibold text-[#F5A623]`}>
//         {rating.toFixed(1)}
//       </span>
//     </div>
//   );
// }

// function LedgerPerformance({ data }: { data: number[] }) {
//   const max = Math.max(...data);
//   const peakIndex = data.indexOf(max);

//   return (
//     <div className="rounded-[10px] bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] px-4 py-[14px]">
//       <div
//         className={` mb-3 text-[9px] font-medium uppercase tracking-[0.12em] text-[#888]`}
//       >
//         Ledger Performance
//       </div>
//       <div className="relative flex h-[56px] items-end gap-[4px]">
//         {data.map((val, i) => {
//           const isPeak = i === peakIndex;
//           const idx = Math.round((val / max) * (BAR_HEIGHTS.length - 1));
//           const heightClass = BAR_HEIGHTS[Math.min(Math.max(idx, 0), BAR_HEIGHTS.length - 1)];
//           return (
//             <div key={i} className="relative flex flex-col items-center">
//               {isPeak && (
//                 <div
//                   className={` absolute -top-[18px] whitespace-nowrap rounded-[3px] bg-[#F5A623] px-[5px] py-[1px] text-[8px] font-bold tracking-[0.05em] text-black`}
//                 >
//                   PEAK
//                 </div>
//               )}
//               <div
//                 className={[
//                   "w-[14px] rounded-t-[2px]",
//                   heightClass,
//                   isPeak
//                     ? "bg-gradient-to-b from-[#F5A623] to-[#E8921A]"
//                     : "bg-[rgba(245,166,35,0.22)]",
//                 ].join(" ")}
//               />
//             </div>
//           );
//         })}
//       </div>
//       <div className={` mt-2 text-[8px] leading-[1.5] text-[#555]`}>
//         Top 1% Engineering Performance index: high reliability in mission-critical Rust deployments.
//       </div>
//     </div>
//   );
// }

// function SkillTag({ label }: { label: string }) {
//   return (
//     <span
//       className={` inline-block   bg-[#EAE7E7] px-3 py-[5px] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#3a3a3a]`}
//     >
//       {label}
//     </span>
//   );
// }

// export default function ProfilePage() {
//   const [profile, setProfile] = useState<FreelancerProfileProps>(DEFAULT_PROFILE);
//   const [isSaving, setIsSaving] = useState(false);
//   const [skillInput, setSkillInput] = useState("");
//   const [editingField, setEditingField] = useState<string | null>(null);
//   const [tempValues, setTempValues] = useState<Record<string, any>>({});

//   const {
//     firstName,
//     lastName,
//     email,
//     name,
//     title,
//     location,
//     memberSince,
//     avatarUrl,
//     verified,
//     hourlyRate,
//     currency,
//     totalEarned,
//     jobSuccess,
//     jobsCompleted,
//     hoursWorked,
//     bio,
//     skills,
//     responseTime,
//     availability,
//     lastActive,
//     workHistory,
//     portfolioItems,
//     performanceData,
//   } = profile;

//   const bioText = bio ?? "";
//   const skillsList = skills ?? [];
//   const workHistoryList = workHistory ?? [];
//   const portfolioItemsList = portfolioItems ?? [];
//   const performanceDataList = performanceData ?? [];

//   const startEditing = (field: string) => {
//     setEditingField(field);
//     setTempValues({ ...tempValues, [field]: profile[field as keyof typeof profile] });
//   };

//   const cancelEditing = () => {
//     setEditingField(null);
//   };

//   const handleSaveField = async () => {
//     if (!editingField) return;
//     const value = tempValues[editingField];
//     const user = firebaseAuth.currentUser;
//     if (!user) return;
//     setIsSaving(true);
//     try {
//       if (editingField === 'firstName' || editingField === 'lastName') {
//         const fullName = editingField === 'firstName' ? `${value} ${lastName}` : `${firstName} ${value}`;
//         await updateDoc(doc(firebaseDb, "all_users", user.uid), {
//           [editingField]: value,
//           fullName,
//           updatedAt: serverTimestamp(),
//         });
//         setProfile(prev => ({ ...prev, [editingField]: value, name: fullName }));
//       } else {
//         await updateDoc(doc(firebaseDb, "freelancers", user.uid), {
//           [editingField]: value,
//           updatedAt: serverTimestamp(),
//         });
//         setProfile(prev => ({ ...prev, [editingField]: value }));
//       }
//       setEditingField(null);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // useEffect(() => {
//   //   const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
//   //     if (!user) return;
//   //     try {
//   //       const allUsersSnap = await getDoc(doc(firebaseDb, "all_users", user.uid));
//   //       const freelancerSnap = await getDoc(doc(firebaseDb, "freelancers", user.uid));
//   //       const allData = allUsersSnap.exists() ? (allUsersSnap.data() as any) : {};
//   //       const freeData = freelancerSnap.exists() ? (freelancerSnap.data() as any) : {};
//   //       const firstNameValue = allData.firstName ?? DEFAULT_PROFILE.firstName;
//   //       const lastNameValue = allData.lastName ?? DEFAULT_PROFILE.lastName;
//   //       const hasNameData = allData.firstName || allData.lastName || allData.fullName;
//   //       const nameValue = hasNameData ? (allData.fullName ?? `${firstNameValue} ${lastNameValue}`.trim()) : DEFAULT_PROFILE.name;

//   //       setProfile((prev) => ({
//   //         ...prev,
//   //         firstName: firstNameValue,
//   //         lastName: lastNameValue,
//   //         email: allData.email ?? user.email ?? prev.email,
//   //         name: nameValue,
//   //         title: freeData.title ?? prev.title,
//   //         location: freeData.location ?? prev.location,
//   //         bio: freeData.bio ?? prev.bio,
//   //         skills: Array.isArray(freeData.skills) ? freeData.skills : prev.skills,
//   //         hourlyRate: freeData.hourlyRate ?? prev.hourlyRate,
//   //         availability: freeData.availability ?? prev.availability,
//   //         responseTime: freeData.responseTime ?? prev.responseTime,
//   //       }));
//   //     } catch {
//   //       // keep defaults
//   //     }
//   //   });
//   //   return () => unsubscribe();
//   // }, []);

//   useEffect(() => {
//   // console.log("🔥 useEffect mounted — setting up auth listener");

//   const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
//     // console.log("👤 Auth state changed:", user ? `logged in as ${user.uid}` : "NOT logged in");

//     if (!user) {
//       // console.warn("❌ No user found — profile will not load");
//       return;
//     }

//     try {
//       // console.log("📦 Fetching all_users doc for uid:", user.uid);
//       const allUsersSnap = await getDoc(doc(firebaseDb, "all_users", user.uid));
//       // console.log("📄 all_users doc exists?", allUsersSnap.exists());
//       // console.log("📄 all_users data:", allUsersSnap.data());

//       // console.log("📦 Fetching freelancers doc for uid:", user.uid);
//       const freelancerSnap = await getDoc(doc(firebaseDb, "freelancers", user.uid));
//       // console.log("📄 freelancers doc exists?", freelancerSnap.exists());
//       // console.log("📄 freelancers data:", freelancerSnap.data());

//       const allData = allUsersSnap.exists() ? (allUsersSnap.data() as any) : {};
//       const freeData = freelancerSnap.exists() ? (freelancerSnap.data() as any) : {};

//       // Name resolution
//       const firstNameValue = allData.firstName?.trim() || "";
//       const lastNameValue = allData.lastName?.trim() || "";
//       const fullNameValue =
//         allData.fullName?.trim() ||
//         [firstNameValue, lastNameValue].filter(Boolean).join(" ") ||
//         user.displayName?.trim() ||
//         DEFAULT_PROFILE.name!;

//       // console.log("🧑 Resolved name:", { firstNameValue, lastNameValue, fullNameValue });

//       // Member Since
//       const createdAtRaw = allData.createdAt ?? freeData.createdAt ?? null;
//       // console.log("📅 createdAt raw value:", createdAtRaw);

//       let memberSinceFormatted = "";
//       if (createdAtRaw) {
//         const date: Date =
//           typeof createdAtRaw.toDate === "function"
//             ? createdAtRaw.toDate()
//             : new Date(createdAtRaw);
//         memberSinceFormatted = date.toLocaleDateString("en-US", {
//           month: "long",
//           year: "numeric",
//         });
//         // console.log("📅 memberSince formatted:", memberSinceFormatted);
//       } else {
//         // console.warn("⚠️ No createdAt field found in either document");
//       }

//       const updatedProfile = {
//         firstName: firstNameValue || DEFAULT_PROFILE.firstName!,
//         lastName: lastNameValue || DEFAULT_PROFILE.lastName!,
//         email: allData.email ?? user.email ?? "",
//         name: fullNameValue,
//         memberSince: memberSinceFormatted,
//         title: freeData.title ?? DEFAULT_PROFILE.title,
//         location: freeData.location ?? DEFAULT_PROFILE.location,
//         bio: freeData.bio ?? DEFAULT_PROFILE.bio,
//         skills: Array.isArray(freeData.skills) ? freeData.skills : [],
//         hourlyRate: freeData.hourlyRate ?? DEFAULT_PROFILE.hourlyRate,
//         availability: freeData.availability ?? DEFAULT_PROFILE.availability,
//         responseTime: freeData.responseTime ?? DEFAULT_PROFILE.responseTime,
//       };

//       // console.log("✅ Final profile to set:", updatedProfile);

//       setProfile((prev) => ({ ...prev, ...updatedProfile }));
//     } catch (err) {
//       // console.error("🔴 Error fetching profile:", err);
//     }
//   });

//   return () => unsubscribe();
// }, []);
//   return (
//     <div className={`min-h-screen bg-[#F7F6F3] `}>
//       <div className="flex">
//         <FreelancerSidebar active="/freelancer/dashboard/profile" />

//         <div className="flex-1 lg:ml-0">
//           <div className="min-h-screen overflow-y-auto pt-4 md:pt-0">
//             <div className="w-full px-4 max-md:pt-10 sm:px-6 lg:px-2 md:pt-5 ">
//               <div className=" w-full flex flex-col items-start gap-6   p-5   lg:flex-row">
//                 <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
//                   <div>
//                     <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start">
//                       <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#EAE7E2] bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a]">
//                         {avatarUrl ? (
//                           <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
//                         ) : (
//                           <div className="text-[28px] text-[#888]">BTC</div>
//                         )}
//                       </div>

//                       <div className="min-w-0">
//                         <div className="flex items-center gap-2">
//                           <h1 className="truncate text-[22px] font-semibold tracking-[-0.02em] text-[#1a1a1a] sm:text-[26px]">
//                             {name}
//                           </h1>
//                           {verified && (
//                             <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
//                               <circle cx="12" cy="12" r="10" fill="#1D9BF0" />
//                               <path
//                                 fill="none"
//                                 stroke="#fff"
//                                 strokeWidth="2.5"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 d="M7 13l3 3 7-7"
//                               />
//                             </svg>
//                           )}
//                         </div>
//                         <div className="mt-[3px] text-[13px] italic text-[#666] sm:text-[14px] flex items-center gap-2">
//                           {editingField === 'title' ? (
//                             <>
//                               <input
//                                 value={tempValues.title || ''}
//                                 onChange={(e) => setTempValues({ ...tempValues, title: e.target.value })}
//                                 className="border rounded px-2 py-1 text-[13px]"
//                               />
//                               <button onClick={handleSaveField} className="text-blue-500 text-[12px]">Save</button>
//                               <button onClick={cancelEditing} className="text-gray-500 text-[12px]">Cancel</button>
//                             </>
//                           ) : (
//                             <>
//                               {title}
//                               <button onClick={() => startEditing('title')} className="text-gray-400 hover:text-gray-600">
//                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                   <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//                                   <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//                                 </svg>
//                               </button>
//                             </>
//                           )}
//                         </div>
//                         <div className={` mt-2 flex flex-wrap gap-3 text-[11px] text-[#888] sm:gap-4`}>
//                           <span className="flex items-center gap-1">
//                             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
//                               <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
//                               <circle cx="12" cy="10" r="3" />
//                             </svg>
//                             {editingField === 'location' ? (
//                               <>
//                                 <input
//                                   value={tempValues.location || ''}
//                                   onChange={(e) => setTempValues({ ...tempValues, location: e.target.value })}
//                                   className="border rounded px-2 py-1 text-[11px]"
//                                 />
//                                 <button onClick={handleSaveField} className="text-blue-500 text-[10px]">Save</button>
//                                 <button onClick={cancelEditing} className="text-gray-500 text-[10px]">Cancel</button>
//                               </>
//                             ) : (
//                               <>
//                                 {location}
//                                 <button onClick={() => startEditing('location')} className="text-gray-400 hover:text-gray-600 text-[10px]">
//                                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//                                     <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//                                   </svg>
//                                 </button>
//                               </>
//                             )}
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
//                               <rect x="3" y="4" width="18" height="18" rx="2" />
//                               <line x1="16" y1="2" x2="16" y2="6" />
//                               <line x1="8" y1="2" x2="8" y2="6" />
//                               <line x1="3" y1="10" x2="21" y2="10" />
//                             </svg>
//                             Member since {memberSince}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mt-8 grid grid-cols-2 gap-y-4 rounded-[10px] border border-[#E0DDD8] bg-[#F0EDE8] px-4 py-3 sm:mt-10 sm:grid-cols-4 lg:mt-[70px]">
//                       {[
//                         { label: "Total Earned", value: totalEarned, unit: "sats" },
//                         { label: "Job Success", value: `${jobSuccess}`, unit: "%" },
//                         { label: "Jobs Completed", value: `${jobsCompleted}` },
//                         { label: "Hours Worked", value: (hoursWorked ?? 0).toLocaleString() },
//                       ].map((stat, i) => (
//                         <div
//                           key={stat.label}
//                           className={[
//                             "px-2 text-center",
//                             i < 3 ? "sm:border-r sm:border-[#D8D5D0]" : "",
//                           ].join(" ")}
//                         >
//                           <div
//                             className={` mb-1 text-[9px] uppercase tracking-[0.1em] text-[#999]`}
//                           >
//                             {stat.label}
//                           </div>
//                           <div
//                             className={` text-[15px] font-semibold tracking-[-0.02em] text-[black]`}
//                           >
//                             {stat.value}
//                             {stat.unit && <span className="ml-[2px] text-[10px] text-[#aaa]">{stat.unit}</span>}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   <hr className="border-t border-[#EAE7E2]" />

//                   <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
//                     <div>
//                       <div
//                         className={` mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[#F5A623]`}
//                       >
//                         Professional Bio
//                       </div>
//                       {editingField === 'bio' ? (
//                         <div>
//                           <textarea
//                             value={tempValues.bio || ''}
//                             onChange={(e) => setTempValues({ ...tempValues, bio: e.target.value })}
//                             rows={4}
//                             className="w-full border rounded px-3 py-2 text-[13px]"
//                           />
//                           <div className="flex gap-2 mt-2">
//                             <button onClick={handleSaveField} className="text-blue-500">Save</button>
//                             <button onClick={cancelEditing} className="text-gray-500">Cancel</button>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="flex items-start gap-2">
//                           <div>
//                             {bioText.split("\n\n").map((para, i, arr) => (
//                               <p
//                                 key={i}
//                                 className={`text-[13px] leading-[1.75] text-[#555] ${
//                                   i < arr.length - 1 ? "mb-3" : ""
//                                 }`}
//                               >
//                                 {para}
//                               </p>
//                             ))}
//                           </div>
//                           <button onClick={() => startEditing('bio')} className="text-gray-400 hover:text-gray-600 mt-1">
//                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                               <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//                               <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//                             </svg>
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                     <div>
//                       <div
//                         className={` mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[#F5A623]`}
//                       >
//                         Core Expertise
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         {skillsList.map((s) => (
//                           <SkillTag key={s} label={s} />
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   <hr className="border-t border-[#EAE7E2]" />

//                   <div>
//                     <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//                       <div
//                         className={` text-[10px] font-medium uppercase tracking-[0.14em] text-[#F5A623]`}
//                       >
//                         Work History
//                       </div>
//                       <span className={` text-[11px] text-[#aaa]`}>
//                         Showing latest {workHistoryList.length} of {jobsCompleted}
//                       </span>
//                     </div>
//                     <div className="flex flex-col gap-3">
//                       {workHistoryList.map((job, i) => (
//                         <div
//                           key={i}
//                           className="rounded-[10px] border border-[#EAE7E2] bg-white px-4 py-4 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]"
//                         >
//                           <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
//                             <span className="text-[15px] font-medium text-[#1a1a1a]">{job.title}</span>
//                             <div className="flex flex-wrap items-center gap-2">
//                               <span className={` text-[12px] text-[#555]`}>{job.amount}</span>
//                               <span
//                                 className={[
//                                   "rounded-[4px] px-[9px] py-[3px] text-[10px] font-medium uppercase tracking-[0.1em]",
//                                   job.status === "COMPLETED"
//                                     ? "bg-[#E6F4EA] text-[#2E7D32]"
//                                     : "bg-[#E8F0FE] text-[#1565C0]",
//                                 ].join(" ")}
//                               >
//                                 {job.status === "COMPLETED" ? "Completed" : "In Progress"}
//                               </span>
//                             </div>
//                           </div>
//                           <StarRating rating={job.rating} />
//                           <p className="mt-2 text-[12px] italic leading-[1.65] text-[#666]">"{job.review}"</p>
//                           <div className={` mt-2 text-[10px] text-[#bbb]`}>{job.period}</div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   <hr className="border-t border-[#EAE7E2]" />

//                   <div>
//                     <div
//                       className={` mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[#F5A623]`}
//                     >
//                       Portfolio
//                     </div>
//                     <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                       {portfolioItemsList.map((item) => (
//                         <div
//                           key={item.id}
//                           className={[
//                             "aspect-[16/9] overflow-hidden rounded-lg border border-[#EAE7E2] transition-all hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
//                             item.bgClass,
//                           ].join(" ")}
//                         >
//                           {item.id === 1 ? (
//                             <svg viewBox="0 0 200 120" className="block h-full w-full">
//                               <defs>
//                                 <radialGradient id="fpg1" cx="50%" cy="50%" r="50%">
//                                   <stop offset="0%" stopColor="#F5A623" stopOpacity="0.35" />
//                                   <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
//                                 </radialGradient>
//                               </defs>
//                               <rect width="200" height="120" fill="#0d0d0d" />
//                               <circle cx="100" cy="60" r="52" fill="url(#fpg1)" />
//                               {(
//                                 [
//                                   [100, 18],
//                                   [142, 44],
//                                   [132, 82],
//                                   [68, 82],
//                                   [58, 44],
//                                   [100, 60],
//                                 ] as [number, number][]
//                               ).flatMap(([x, y], i, arr) =>
//                                 arr.slice(i + 1).map(([x2, y2], j) => (
//                                   <line
//                                     key={`${i}-${j}`}
//                                     x1={x}
//                                     y1={y}
//                                     x2={x2}
//                                     y2={y2}
//                                     stroke="#F5A623"
//                                     strokeWidth="0.7"
//                                     strokeOpacity="0.45"
//                                   />
//                                 ))
//                               )}
//                               {(
//                                 [
//                                   [100, 18],
//                                   [142, 44],
//                                   [132, 82],
//                                   [68, 82],
//                                   [58, 44],
//                                   [100, 60],
//                                 ] as [number, number][]
//                               ).map(([x, y], i) => (
//                                 <circle key={i} cx={x} cy={y} r="3.5" fill="#F5A623" />
//                               ))}
//                             </svg>
//                           ) : (
//                             <svg viewBox="0 0 200 120" className="block h-full w-full">
//                               <rect width="200" height="120" fill="#0a0a1a" />
//                               {Array.from({ length: 38 }).map((_, i) => {
//                                 const x = (i / 37) * 176 + 12;
//                                 const h = 18 + Math.sin(i * 0.75) * 14 + Math.sin(i * 0.28) * 9;
//                                 return (
//                                   <rect
//                                     key={i}
//                                     x={x - 1.8}
//                                     y={82 - h}
//                                     width="3.5"
//                                     height={h}
//                                     fill={i % 6 === 0 ? "#F5A623" : "#2a2a4a"}
//                                     opacity={0.75}
//                                   />
//                                 );
//                               })}
//                               <polyline
//                                 points={Array.from({ length: 38 })
//                                   .map((_, i) => `${(i / 37) * 176 + 12},${54 + Math.sin(i * 0.48) * 18}`)
//                                   .join(" ")}
//                                 fill="none"
//                                 stroke="#F5A623"
//                                 strokeWidth="1.5"
//                                 opacity="0.85"
//                               />
//                             </svg>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex w-full flex-shrink-0 flex-col gap-4 lg:w-[296px]">
                  
//                   <div className="bg-white py-[20px] px-[20px]">
                  
//                   <div>
//                     <div
//                       className={` mb-1 text-[9px] uppercase tracking-[0.12em] text-[#999]`}
//                     >
//                       Hourly Rate
//                     </div>
//                     <div
//                       className={` text-[24px] font-bold tracking-[-0.03em] text-[#1a1a1a] sm:text-[26px]`}
//                     >
//                       {editingField === 'hourlyRate' ? (
//                         <>
//                           <input
//                             value={tempValues.hourlyRate || ''}
//                             onChange={(e) => setTempValues({ ...tempValues, hourlyRate: e.target.value })}
//                             className="border rounded px-2 py-1 text-[24px]"
//                           />
//                           <button onClick={handleSaveField} className="text-blue-500 ml-2">Save</button>
//                           <button onClick={cancelEditing} className="text-gray-500 ml-2">Cancel</button>
//                         </>
//                       ) : (
//                         <>
//                           {hourlyRate}
//                           <button onClick={() => startEditing('hourlyRate')} className="text-gray-400 hover:text-gray-600 ml-2">
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                               <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//                               <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//                             </svg>
//                           </button>
//                         </>
//                       )}
//                       <span className="ml-[3px] text-[13px] font-normal text-[#888]">{currency}</span>
//                     </div>
//                   </div>

//                   <div className="flex flex-col gap-2">
//                     <button className={` w-full rounded-lg bg-gradient-to-r from-orange-600 to-orange-400 px-3 py-3 text-[13px] font-medium uppercase tracking-[0.06em] text-white transition-all hover:opacity-90 hover:-translate-y-[1px]`}>
//                       Hire Now
//                     </button>
//                     <button className={` w-full rounded-lg   px-3 py-[11px] text-[13px] font-medium uppercase tracking-[0.06em] text-[#3a3a3a] transition-all hover:border-[#F5A623] bg-[#EAE7E7]`}>
//                       Invite to Job
//                     </button>
//                   </div>

//                    <div className="flex mt-[20px] flex-col gap-3">
//                     <div className="flex flex-col gap-[2px]">
//                       <span
//                         className={` text-[9px] uppercase tracking-[0.1em] text-[#aaa]`}
//                       >
//                         Response Time
//                       </span>
//                       <span className={` text-[12px] font-medium text-[#3a3a3a] flex items-center gap-2`}>
//                         {editingField === 'responseTime' ? (
//                           <>
//                             <input
//                               value={tempValues.responseTime || ''}
//                               onChange={(e) => setTempValues({ ...tempValues, responseTime: e.target.value })}
//                               className="border rounded px-2 py-1 text-[12px]"
//                             />
//                             <button onClick={handleSaveField} className="text-blue-500 text-[10px]">Save</button>
//                             <button onClick={cancelEditing} className="text-gray-500 text-[10px]">Cancel</button>
//                           </>
//                         ) : (
//                           <>
//                             {responseTime}
//                             <button onClick={() => startEditing('responseTime')} className="text-gray-400 hover:text-gray-600 text-[10px]">
//                               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                 <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//                                 <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//                               </svg>
//                             </button>
//                           </>
//                         )}
//                       </span>
//                     </div>
//                     <div className="flex flex-col gap-[2px]">
//                       <span
//                         className={` text-[9px] uppercase tracking-[0.1em] text-[#aaa]`}
//                       >
//                         Availability
//                       </span>
//                       <span className={` text-[12px] font-medium text-[#3a3a3a] flex items-center gap-2`}>
//                         {editingField === 'availability' ? (
//                           <>
//                             <input
//                               value={tempValues.availability || ''}
//                               onChange={(e) => setTempValues({ ...tempValues, availability: e.target.value })}
//                               className="border rounded px-2 py-1 text-[12px]"
//                             />
//                             <button onClick={handleSaveField} className="text-blue-500 text-[10px]">Save</button>
//                             <button onClick={cancelEditing} className="text-gray-500 text-[10px]">Cancel</button>
//                           </>
//                         ) : (
//                           <>
//                             {availability}
//                             <button onClick={() => startEditing('availability')} className="text-gray-400 hover:text-gray-600 text-[10px]">
//                               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                 <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//                                 <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//                               </svg>
//                             </button>
//                           </>
//                         )}
//                       </span>
//                     </div>
//                     <div className="flex flex-col gap-[2px]">
//                       <span
//                         className={` text-[9px] uppercase tracking-[0.1em] text-[#aaa]`}
//                       >
//                         Last Active
//                       </span>
//                       <span className={` text-[12px] font-medium text-[#3a3a3a]`}>
//                         {lastActive}
//                       </span>
//                     </div>
//                   </div>
//                   </div>

                 

//                   <LedgerPerformance data={performanceDataList} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import FreelancerSidebar from "@/components/molecules/FreelancerSidebar";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";


// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkHistory {
  title: string;
  amount: string;
  status: "COMPLETED" | "IN_PROGRESS";
  rating: number;
  review: string;
  period: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  imagePublicId?: string;
}

type PortfolioDraft = Omit<PortfolioItem, "id">;

interface FreelancerProfile {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  location: string;
  memberSince: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  verified: boolean;
  hourlyRate: string;
  currency: string;
  totalEarned: string;
  jobSuccess: number;
  jobsCompleted: number;
  hoursWorked: number;
  bio: string;
  skills: string[];
  responseTime: string;
  availability: string;
  lastActive: string;
  workHistory: WorkHistory[];
  portfolioItems: PortfolioItem[];
  performanceData: number[];
}

const EMPTY_PROFILE: FreelancerProfile = {
  firstName: "",
  lastName: "",
  email: "",
  title: "",
  location: "",
  memberSince: "",
  avatarUrl: undefined,
  avatarPublicId: undefined,
  verified: false,
  hourlyRate: "",
  currency: "SATS",
  totalEarned: "",
  jobSuccess: 0,
  jobsCompleted: 0,
  hoursWorked: 0,
  bio: "",
  skills: [],
  responseTime: "",
  availability: "",
  lastActive: "",
  workHistory: [],
  portfolioItems: [],
  performanceData: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BAR_HEIGHTS = [
  "h-[6px]","h-[10px]","h-[14px]","h-[18px]","h-[22px]","h-[26px]",
  "h-[30px]","h-[34px]","h-[38px]","h-[42px]","h-[46px]","h-[48px]",
] as const;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i <= rating ? "#F5A623" : "#D1D0CE"} className="block">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span className="ml-[3px] text-[12px] font-semibold text-[#F5A623]">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function LedgerPerformance({ data }: { data: number[] }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const peakIndex = data.indexOf(max);
  return (
    <div className="rounded-[10px] bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] px-4 py-[14px]">
      <div className="mb-3 text-[9px] font-medium uppercase tracking-[0.12em] text-[#888]">
        Ledger Performance
      </div>
      <div className="relative flex h-[56px] items-end gap-[4px]">
        {data.map((val, i) => {
          const isPeak = i === peakIndex;
          const idx = Math.round((val / max) * (BAR_HEIGHTS.length - 1));
          const hClass = BAR_HEIGHTS[Math.min(Math.max(idx, 0), BAR_HEIGHTS.length - 1)];
          return (
            <div key={i} className="relative flex flex-col items-center">
              {isPeak && (
                <div className="absolute -top-[18px] whitespace-nowrap rounded-[3px] bg-[#F5A623] px-[5px] py-[1px] text-[8px] font-bold tracking-[0.05em] text-black">
                  PEAK
                </div>
              )}
              <div className={["w-[14px] rounded-t-[2px]", hClass,
                isPeak ? "bg-gradient-to-b from-[#F5A623] to-[#E8921A]" : "bg-[rgba(245,166,35,0.22)]",
              ].join(" ")} />
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-[8px] leading-[1.5] text-[#555]">
        Top 1% Engineering Performance index: high reliability in mission-critical deployments.
      </div>
    </div>
  );
}

// ─── Inline Edit Field ────────────────────────────────────────────────────────

interface InlineEditProps {
  value: string;
  placeholder: string;
  onSave: (val: string) => Promise<void>;
  className?: string;
  multiline?: boolean;
  displayClassName?: string;
}

function InlineEdit({ value, placeholder, onSave, className = "", multiline = false, displayClassName = "" }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(draft.trim()); setEditing(false); }
    finally { setSaving(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) handleSave();
    if (e.key === "Escape") { setDraft(value); setEditing(false); }
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-1 w-full">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className={`w-full rounded-lg border border-[#F5A623] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] outline-none ring-2 ring-[#F5A62330] resize-none ${className}`}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full rounded-lg border border-[#F5A623] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] outline-none ring-2 ring-[#F5A62330] ${className}`}
          />
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 rounded-md bg-[#F5A623] px-3 py-1 text-[11px] font-semibold text-black transition hover:bg-[#e8921a] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => { setDraft(value); setEditing(false); }}
            className="rounded-md px-3 py-1 text-[11px] font-medium text-[#888] transition hover:text-[#333]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={`group flex items-center gap-1.5 text-left transition-opacity hover:opacity-80 ${displayClassName}`}
    >
      {value ? (
        <span>{value}</span>
      ) : (
        <span className="text-[#bbb]">{placeholder}</span>
      )}
      <EditIcon />
    </button>
  );
}

function EditIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      className="flex-shrink-0 text-[#ccc] group-hover:text-[#F5A623] transition-colors">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

// ─── Hourly Rate Editor ───────────────────────────────────────────────────────

function HourlyRateCard({
  hourlyRate, currency, onSave,
}: { hourlyRate: string; currency: string; onSave: (rate: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(hourlyRate);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(hourlyRate); }, [hourlyRate]);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(draft); setEditing(false); }
    finally { setSaving(false); }
  };

  return (
    <div className="rounded-xl border border-[#EAE7E2] bg-white px-5 py-5">
      <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#aaa]">
        Hourly Rate
      </p>

      {editing ? (
        <div className=" flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#F5A623] bg-[#FFFBF4] px-2 py-1 ring-2 ring-[#F5A62320]">
            <span className="text-[10px]  text-[#aaa]">{currency}</span>
            <input
              autoFocus
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
              placeholder="e.g. 85"
              className="flex-1 bg-transparent text-[10px] font-bold tracking-[-0.03em] text-[#1a1a1a] outline-none placeholder:text-[#ddd]"
            />
            <span className="text-[13px] text-[#bbb]">/hr</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-[#F5A623] py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-black transition hover:bg-[#e8921a] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Rate"}
            </button>
            <button
              onClick={() => { setDraft(hourlyRate); setEditing(false); }}
              className="rounded-lg border border-[#EAE7E2] px-4 py-2 text-[12px] font-medium text-[#888] transition hover:border-[#ccc]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {hourlyRate ? (
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[13px] font-medium text-[#aaa]">{currency}</span>
              <span className="text-[32px] font-bold tracking-[-0.03em] text-[#1a1a1a] leading-none">
                {hourlyRate}
              </span>
              <span className="text-[13px] text-[#bbb]">/hr</span>
            </div>
          ) : (
            <p className="mt-1 text-[15px] text-[#ccc]">Not set yet</p>
          )}
          <button
            onClick={() => setEditing(true)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#EAE7E2] py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] transition hover:border-[#F5A623] hover:text-[#F5A623]"
          >
            <EditIcon size={11} />
            {hourlyRate ? "Edit Rate" : "Set Rate"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Skills Manager ───────────────────────────────────────────────────────────

function SkillsManager({
  skills, onSave,
}: { skills: string[]; onSave: (skills: string[]) => Promise<void> }) {
  const [adding, setAdding] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (adding) inputRef.current?.focus(); }, [adding]);

  const save = async (updated: string[]) => {
    setSaving(true);
    try { await onSave(updated); }
    finally { setSaving(false); }
  };

  const handleAdd = async () => {
    const trimmed = newSkill.trim();
    if (!trimmed || skills.includes(trimmed)) { setAdding(false); setNewSkill(""); return; }
    await save([...skills, trimmed]);
    setNewSkill("");
    setAdding(false);
  };

  const handleDelete = (idx: number) => save(skills.filter((_, i) => i !== idx));

  const handleEdit = async (idx: number) => {
    const trimmed = editDraft.trim();
    if (!trimmed) return;
    const updated = [...skills];
    updated[idx] = trimmed;
    await save(updated);
    setEditingIdx(null);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
          Core Expertise
        </p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 rounded-md bg-[#F5A62315] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#F5A623] transition hover:bg-[#F5A62325]"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Skill
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((s, i) => (
          editingIdx === i ? (
            <div key={i} className="flex items-center gap-1">
              <input
                autoFocus
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleEdit(i); if (e.key === "Escape") setEditingIdx(null); }}
                className="rounded-md border border-[#F5A623] bg-white px-2 py-1 text-[11px] outline-none w-28"
              />
              <button onClick={() => handleEdit(i)}
                className="rounded bg-[#F5A623] px-2 py-1 text-[10px] font-bold text-black">
                ✓
              </button>
              <button onClick={() => setEditingIdx(null)}
                className="rounded bg-[#eee] px-2 py-1 text-[10px] text-[#666]">
                ✕
              </button>
            </div>
          ) : (
            <div key={i} className="group flex items-center gap-0 rounded-sm bg-[#EAE7E7] overflow-hidden">
              <span className="px-3 py-[5px] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#3a3a3a]">
                {s}
              </span>
              <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                <button
                  onClick={() => { setEditingIdx(i); setEditDraft(s); }}
                  className="flex items-center justify-center rounded p-1 text-[#888] hover:text-[#F5A623] transition-colors"
                  title="Edit skill"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(i)}
                  className="flex items-center justify-center rounded p-1 text-[#888] hover:text-red-500 transition-colors"
                  title="Delete skill"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          )
        ))}

        {adding && (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setNewSkill(""); } }}
              placeholder="e.g. React"
              className="rounded-md border border-[#F5A623] bg-white px-2 py-1.5 text-[11px] outline-none ring-2 ring-[#F5A62320] w-28"
            />
            <button onClick={handleAdd} disabled={saving}
              className="rounded bg-[#F5A623] px-2 py-1.5 text-[10px] font-bold text-black disabled:opacity-60">
              {saving ? "…" : "Add"}
            </button>
            <button onClick={() => { setAdding(false); setNewSkill(""); }}
              className="rounded bg-[#eee] px-2 py-1.5 text-[10px] text-[#666]">
              ✕
            </button>
          </div>
        )}

        {!skills.length && !adding && (
          <p className="text-[12px] text-[#bbb]">No skills added yet — click Add Skill to start.</p>
        )}
      </div>
    </div>
  );
}

// ─── Portfolio Manager ────────────────────────────────────────────────────────

function PortfolioForm({
  draft,
  setDraft,
  saving,
  imageUploading,
  imageError,
  portfolioImageInputRef,
  handlePortfolioImageFileChange,
  openPortfolioImagePicker,
  onSubmit,
  onCancel,
}: {
  draft: PortfolioDraft;
  setDraft: Dispatch<SetStateAction<PortfolioDraft>>;
  saving: boolean;
  imageUploading: boolean;
  imageError: string;
  portfolioImageInputRef: RefObject<HTMLInputElement | null>;
  handlePortfolioImageFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  openPortfolioImagePicker: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#F5A623] bg-[#FFFBF4] p-4 flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#aaa]">
          Project Title *
        </label>
        <input
          value={draft.title}
          onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="e.g. Bitcoin Payment Gateway"
          className="w-full rounded-lg border border-[#EAE7E2] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A62320]"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#aaa]">
          Description
        </label>
        <textarea
          value={draft.description}
          onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the project..."
          rows={2}
          className="w-full rounded-lg border border-[#EAE7E2] bg-white px-3 py-2 text-[13px] outline-none resize-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A62320]"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#aaa]">
          Project Image (optional)
        </label>
        <input
          ref={portfolioImageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handlePortfolioImageFileChange}
        />
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={openPortfolioImagePicker}
            disabled={imageUploading}
            className="w-full rounded-lg border border-[#EAE7E2] bg-white px-3 py-2 text-[12px] font-medium text-[#444] transition hover:border-[#F5A623] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {imageUploading ? "Uploading image..." : draft.imageUrl ? "Replace image" : "Upload image from device"}
          </button>
          {draft.imageUrl ? (
            <div className="overflow-hidden rounded-lg border border-[#EAE7E2] bg-white">
              <img src={draft.imageUrl} alt="Portfolio preview" className="aspect-[16/9] w-full object-cover" />
            </div>
          ) : null}
          {draft.imageUrl ? (
            <button
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, imageUrl: "", imagePublicId: "" }))}
              className="self-start text-[11px] font-medium text-red-500 transition hover:text-red-600"
            >
              Remove image
            </button>
          ) : null}
          {imageError ? <p className="text-[11px] text-red-500">{imageError}</p> : null}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onSubmit}
          disabled={saving || imageUploading || !draft.title.trim()}
          className="flex-1 rounded-lg bg-[#F5A623] py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-black transition hover:bg-[#e8921a] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Project"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-[#EAE7E2] px-4 py-2 text-[12px] font-medium text-[#888] transition hover:border-[#ccc]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function PortfolioManager({
  items, onSave,
}: { items: PortfolioItem[]; onSave: (items: PortfolioItem[]) => Promise<void> }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PortfolioDraft>({
    title: "",
    description: "",
    imageUrl: "",
    imagePublicId: "",
  });
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const portfolioImageInputRef = useRef<HTMLInputElement>(null);

  const save = async (updated: PortfolioItem[]) => {
    setSaving(true);
    try { await onSave(updated); }
    finally { setSaving(false); }
  };

  const normalizeDraft = () => ({
    title: draft.title.trim(),
    description: draft.description.trim(),
    imageUrl: draft.imageUrl?.trim() || undefined,
    imagePublicId: draft.imagePublicId?.trim() || undefined,
  });

  const openPortfolioImagePicker = () => {
    if (imageUploading) return;
    portfolioImageInputRef.current?.click();
  };

  const handlePortfolioImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Use JPG, PNG, or WEBP.");
      event.target.value = "";
      return;
    }

    const maxBytes = 4 * 1024 * 1024;
    if (file.size > maxBytes) {
      setImageError("Image must be 4MB or less.");
      event.target.value = "";
      return;
    }

    const user = firebaseAuth.currentUser;
    if (!user) {
      setImageError("Please log in again to upload.");
      event.target.value = "";
      return;
    }

    setImageError("");
    setImageUploading(true);
    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/portfolio/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });

      const payload = (await uploadResponse.json()) as {
        imageUrl?: string;
        imagePublicId?: string;
        error?: string;
      };

      if (!uploadResponse.ok || !payload.imageUrl || !payload.imagePublicId) {
        throw new Error(payload.error || "Image upload failed.");
      }

      setDraft((prev) => ({
        ...prev,
        imageUrl: payload.imageUrl,
        imagePublicId: payload.imagePublicId,
      }));
    } catch (error) {
      console.error("Portfolio image upload failed:", error);
      setImageError("Could not upload image. Please retry.");
    } finally {
      setImageUploading(false);
      event.target.value = "";
    }
  };

  const handleAdd = async () => {
    if (!draft.title.trim()) return;
    const newItem: PortfolioItem = { id: crypto.randomUUID(), ...normalizeDraft() };
    await save([...items, newItem]);
    setDraft({ title: "", description: "", imageUrl: "", imagePublicId: "" });
    setAdding(false);
    setImageError("");
  };

  const handleUpdate = async (id: string) => {
    await save(items.map((it) => (it.id === id ? { ...it, ...normalizeDraft() } : it)));
    setEditingId(null);
    setImageError("");
  };

  const handleDelete = (id: string) => save(items.filter((it) => it.id !== id));

  const startEdit = (item: PortfolioItem) => {
    setEditingId(item.id);
    setDraft({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl ?? "",
      imagePublicId: item.imagePublicId ?? "",
    });
    setImageError("");
  };


  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
          Portfolio
        </p>
        {!adding && (
          <button
            onClick={() => {
              setAdding(true);
              setEditingId(null);
              setDraft({ title: "", description: "", imageUrl: "", imagePublicId: "" });
              setImageError("");
            }}
            className="flex items-center gap-1 rounded-md bg-[#F5A62315] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#F5A623] transition hover:bg-[#F5A62325]"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          editingId === item.id ? (
            <PortfolioForm
              key={item.id}
              draft={draft}
              setDraft={setDraft}
              saving={saving}
              imageUploading={imageUploading}
              imageError={imageError}
              portfolioImageInputRef={portfolioImageInputRef}
              handlePortfolioImageFileChange={handlePortfolioImageFileChange}
              openPortfolioImagePicker={openPortfolioImagePicker}
              onSubmit={() => handleUpdate(item.id)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={item.id}
              className="group relative overflow-hidden rounded-xl border border-[#EAE7E2] bg-white transition hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title}
                  className="aspect-[16/9] w-full object-cover" />
              ) : (
                <div className="aspect-[16/9] w-full bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
              <div className="px-3 py-3">
                <p className="text-[13px] font-semibold text-[#1a1a1a]">{item.title}</p>
                {item.description && (
                  <p className="mt-1 text-[11px] leading-[1.6] text-[#888]">{item.description}</p>
                )}
              </div>
              {/* Actions */}
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(item)}
                  className="flex items-center justify-center rounded-lg bg-white/90 p-1.5 shadow-sm text-[#555] hover:text-[#F5A623] transition-colors backdrop-blur-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(item.id)}
                  className="flex items-center justify-center rounded-lg bg-white/90 p-1.5 shadow-sm text-[#555] hover:text-red-500 transition-colors backdrop-blur-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          )
        ))}

        {adding && (
          <PortfolioForm
            draft={draft}
            setDraft={setDraft}
            saving={saving}
            imageUploading={imageUploading}
            imageError={imageError}
            portfolioImageInputRef={portfolioImageInputRef}
            handlePortfolioImageFileChange={handlePortfolioImageFileChange}
            openPortfolioImagePicker={openPortfolioImagePicker}
            onSubmit={handleAdd}
            onCancel={() => {
              setAdding(false);
              setDraft({ title: "", description: "", imageUrl: "", imagePublicId: "" });
              setImageError("");
            }}
          />
        )}
      </div>

      {!items.length && !adding && (
        <p className="text-[12px] text-[#bbb]">No portfolio items yet — click Add Project to showcase your work.</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<FreelancerProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");

  // ── Firestore helpers ──────────────────────────────────────────────────────

  const saveAllUsers = async (fields: Record<string, any>) => {
    const user = firebaseAuth.currentUser;
    if (!user) return;
    await updateDoc(doc(firebaseDb, "all_users", user.uid), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
  };

  const saveFreelancer = async (fields: Record<string, any>) => {
    const user = firebaseAuth.currentUser;
    if (!user) return;
    await updateDoc(doc(firebaseDb, "freelancers", user.uid), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
  };

  // ── Field savers ───────────────────────────────────────────────────────────

  const saveField = (field: keyof FreelancerProfile, isAllUsers = false) =>
    async (value: any) => {
      const normalizedValue = typeof value === "string" ? value.trim() : value;
      const isNameField = field === "firstName" || field === "lastName";
      const updates: Record<string, any> = { [field]: normalizedValue };
      if (field === "firstName") updates.fullName = `${normalizedValue} ${profile.lastName}`.trim();
      if (field === "lastName") updates.fullName = `${profile.firstName} ${normalizedValue}`.trim();
      if (isAllUsers) {
        if (isNameField && !normalizedValue) return;
        await saveAllUsers(updates);
      } else {
        if (isNameField && !normalizedValue) return;
        if (isNameField) {
          await Promise.all([saveFreelancer(updates), saveAllUsers(updates)]);
        } else {
          await saveFreelancer(updates);
        }
      }
      setProfile((prev) => ({ ...prev, [field]: normalizedValue }));
    };

  const saveSkills = async (skills: string[]) => {
    await saveFreelancer({ skills });
    setProfile((prev) => ({ ...prev, skills }));
  };

  const savePortfolio = async (portfolioItems: PortfolioItem[]) => {
    await saveFreelancer({ portfolioItems });
    setProfile((prev) => ({ ...prev, portfolioItems }));
  };

  const handleAvatarClick = () => {
    if (avatarUploading) return;
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Use JPG, PNG, or WEBP.");
      event.target.value = "";
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setAvatarError("Image must be 2MB or less.");
      event.target.value = "";
      return;
    }

    const user = firebaseAuth.currentUser;
    if (!user) {
      setAvatarError("Please log in again to upload.");
      event.target.value = "";
      return;
    }

    setAvatarError("");
    setAvatarUploading(true);
    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/avatar/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });

      const payload = (await uploadResponse.json()) as {
        avatarUrl?: string;
        avatarPublicId?: string;
        error?: string;
      };

      if (!uploadResponse.ok || !payload.avatarUrl || !payload.avatarPublicId) {
        throw new Error(payload.error || "Avatar upload failed.");
      }

      const avatarFields = {
        avatarUrl: payload.avatarUrl,
        avatarPublicId: payload.avatarPublicId,
      };

      await Promise.all([
        saveFreelancer(avatarFields),
        saveAllUsers(avatarFields),
      ]);

      setProfile((prev) => ({
        ...prev,
        avatarUrl: payload.avatarUrl,
        avatarPublicId: payload.avatarPublicId,
      }));
    } catch (error) {
      console.error("Avatar upload failed:", error);
      setAvatarError("Could not upload avatar. Please retry.");
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  // ── Fetch on mount ─────────────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      if (!user) { setLoading(false); return; }

      try {
        const [allSnap, freeSnap] = await Promise.all([
          getDoc(doc(firebaseDb, "all_users", user.uid)),
          getDoc(doc(firebaseDb, "freelancers", user.uid)),
        ]);

        const a = allSnap.exists() ? (allSnap.data() as any) : {};
        const f = freeSnap.exists() ? (freeSnap.data() as any) : {};

        // Member since
        const createdAtRaw = a.createdAt ?? f.createdAt ?? user.metadata.creationTime ?? null;
        let memberSince = "";
        if (createdAtRaw) {
          const d = typeof createdAtRaw.toDate === "function"
            ? createdAtRaw.toDate()
            : new Date(createdAtRaw);
          memberSince = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        }

        const freelancerFirstName = typeof f.firstName === "string" ? f.firstName.trim() : "";
        const freelancerLastName = typeof f.lastName === "string" ? f.lastName.trim() : "";

        const displayNameParts = (user.displayName ?? "")
          .trim()
          .split(/\s+/)
          .filter(Boolean);

        const resolvedFirstName = freelancerFirstName || displayNameParts[0] || "";
        const resolvedLastName =
          freelancerLastName ||
          (displayNameParts.length > 1 ? displayNameParts.slice(1).join(" ") : "");

        setProfile((prev) => ({
          ...prev,
          firstName: resolvedFirstName || prev.firstName || "",
          lastName: resolvedLastName || prev.lastName || "",
          email: a.email ?? user.email ?? prev.email,
          title: f.title ?? prev.title,
          location: f.location ?? prev.location,
          memberSince,
          avatarUrl: f.avatarUrl ?? a.avatarUrl ?? prev.avatarUrl ?? undefined,
          avatarPublicId: f.avatarPublicId ?? a.avatarPublicId ?? prev.avatarPublicId ?? undefined,
          verified: f.verified ?? prev.verified,
          hourlyRate: f.hourlyRate ?? prev.hourlyRate,
          currency: f.currency ?? prev.currency ?? "SATS",
          totalEarned: f.totalEarned ?? prev.totalEarned,
          jobSuccess: typeof f.jobSuccess === "number" ? f.jobSuccess : prev.jobSuccess,
          jobsCompleted: typeof f.jobsCompleted === "number" ? f.jobsCompleted : prev.jobsCompleted,
          hoursWorked: typeof f.hoursWorked === "number" ? f.hoursWorked : prev.hoursWorked,
          bio: f.bio ?? prev.bio,
          skills: Array.isArray(f.skills) ? f.skills : prev.skills,
          responseTime: f.responseTime ?? prev.responseTime,
          availability: f.availability ?? prev.availability,
          lastActive: f.lastActive ?? prev.lastActive,
          workHistory: Array.isArray(f.workHistory) ? f.workHistory : prev.workHistory,
          portfolioItems: Array.isArray(f.portfolioItems) ? f.portfolioItems : prev.portfolioItems,
          performanceData: Array.isArray(f.performanceData) ? f.performanceData : prev.performanceData,
        }));
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex">
        <FreelancerSidebar active="/freelancer/dashboard/profile" />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-[#F5A623] border-t-transparent animate-spin" />
            <p className="text-[12px] text-[#aaa] uppercase tracking-widest">Loading profile…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <div className="flex">
        <FreelancerSidebar active="/freelancer/dashboard/profile" />

        <div className="flex-1 lg:ml-0">
          <div className="min-h-screen overflow-y-auto pt-4 md:pt-0">
            <div className="w-full px-4 max-md:pt-10 sm:px-6 lg:px-2 md:pt-5">
              <div className="w-full flex flex-col items-start gap-6 p-5 lg:flex-row">

                {/* ── Left column ── */}
                <div className="flex w-full min-w-0 flex-1 flex-col gap-6">

                  {/* Header */}
                  <div>
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start">
                      {/* Avatar */}
                      <button
                        type="button"
                        onClick={handleAvatarClick}
                        disabled={avatarUploading}
                        className="group relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#EAE7E2] bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] disabled:cursor-not-allowed"
                        title="Click to change profile photo"
                      >
                        {profile.avatarUrl ? (
                          <img src={profile.avatarUrl} alt={fullName} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[20px] font-bold text-[#555]">
                            {profile.firstName ? profile.firstName[0].toUpperCase() : "?"}
                          </span>
                        )}
                        <span className="absolute inset-0 hidden items-center justify-center bg-black/45 text-[10px] font-semibold uppercase tracking-[0.08em] text-white group-hover:flex">
                          {avatarUploading ? "Uploading..." : "Change"}
                        </span>
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleAvatarFileChange}
                      />

                      {/* Name + meta */}
                      <div className="min-w-0 flex-1">
                        {/* Name — edit firstName / lastName together */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#1a1a1a] sm:text-[26px]">
                            {fullName || <span className="text-[#bbb]">Your Name</span>}
                          </h1>
                          {profile.verified && (
                            <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
                              <circle cx="12" cy="12" r="10" fill="#1D9BF0" />
                              <path fill="none" stroke="#fff" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 7-7" />
                            </svg>
                          )}
                        </div>

                        {/* Name edit row */}
                        <div className="mt-1 flex flex-wrap gap-2">
                          <InlineEdit
                            value={profile.firstName}
                            placeholder="First name"
                            onSave={saveField("firstName")}
                            displayClassName="text-[12px] text-[#aaa]"
                          />
                          <InlineEdit
                            value={profile.lastName}
                            placeholder="Last name"
                            onSave={saveField("lastName")}
                            displayClassName="text-[12px] text-[#aaa]"
                          />
                        </div>

                        {/* Title */}
                        <div className="mt-2">
                          <InlineEdit
                            value={profile.title}
                            placeholder="Add your professional title"
                            onSave={saveField("title")}
                            displayClassName="text-[13px] text-[#666] sm:text-[14px]"
                          />
                        </div>

                        {/* Location + member since */}
                        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[#888] sm:gap-4">
                          <span className="flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <InlineEdit
                              value={profile.location}
                              placeholder="Add location"
                              onSave={saveField("location")}
                              displayClassName="text-[11px] text-[#888]"
                            />
                          </span>
                          {profile.memberSince && (
                            <span className="flex items-center gap-1">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              Member since {profile.memberSince}
                            </span>
                          )}
                        </div>
                        {avatarError && (
                          <p className="mt-2 text-[11px] text-red-500">{avatarError}</p>
                        )}
                      </div>
                    </div>

                    {/* Stats bar */}
                    <div className="mt-8 grid grid-cols-2 gap-y-4 rounded-[10px] border border-[#E0DDD8] bg-[#F0EDE8] px-4 py-3 sm:mt-10 sm:grid-cols-4 lg:mt-[70px]">
                      {[
                        { label: "Total Earned", value: profile.totalEarned || "—", unit: profile.totalEarned ? "sats" : "" },
                        { label: "Job Success", value: `${profile.jobSuccess}`, unit: "%" },
                        { label: "Jobs Completed", value: `${profile.jobsCompleted}` },
                        { label: "Hours Worked", value: (profile.hoursWorked ?? 0).toLocaleString() },
                      ].map((stat, i) => (
                        <div key={stat.label}
                          className={["px-2 text-center", i < 3 ? "sm:border-r sm:border-[#D8D5D0]" : ""].join(" ")}>
                          <div className="mb-1 text-[9px] uppercase tracking-[0.1em] text-[#999]">{stat.label}</div>
                          <div className="text-[15px] font-semibold tracking-[-0.02em] text-black">
                            {stat.value}
                            {stat.unit && <span className="ml-[2px] text-[10px] text-[#aaa]">{stat.unit}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="border-t border-[#EAE7E2]" />

                  {/* Bio + Skills */}
                  <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
                    <div>
                      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
                        Professional Bio
                      </p>
                      <InlineEdit
                        value={profile.bio}
                        placeholder="Add your professional bio — tell clients what makes you great"
                        onSave={saveField("bio")}
                        multiline
                        displayClassName="text-[13px] leading-[1.75] text-[#555]"
                      />
                    </div>
                    <SkillsManager skills={profile.skills} onSave={saveSkills} />
                  </div>

                  <hr className="border-t border-[#EAE7E2]" />

                  {/* Work History */}
                  <div>
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
                        Work History
                      </p>
                      <span className="text-[11px] text-[#aaa]">
                        Showing {profile.workHistory.length} of {profile.jobsCompleted}
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {profile.workHistory.length ? profile.workHistory.map((job, i) => (
                        <div key={i}
                          className="rounded-[10px] border border-[#EAE7E2] bg-white px-4 py-4 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]">
                          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <span className="text-[15px] font-medium text-[#1a1a1a]">{job.title}</span>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[12px] text-[#555]">{job.amount}</span>
                              <span className={["rounded-[4px] px-[9px] py-[3px] text-[10px] font-medium uppercase tracking-[0.1em]",
                                job.status === "COMPLETED" ? "bg-[#E6F4EA] text-[#2E7D32]" : "bg-[#E8F0FE] text-[#1565C0]",
                              ].join(" ")}>
                                {job.status === "COMPLETED" ? "Completed" : "In Progress"}
                              </span>
                            </div>
                          </div>
                          <StarRating rating={job.rating} />
                          <p className="mt-2 text-[12px] leading-[1.65] text-[#666]">"{job.review}"</p>
                          <div className="mt-2 text-[10px] text-[#bbb]">{job.period}</div>
                        </div>
                      )) : (
                        <p className="text-[12px] text-[#bbb]">No work history yet — completed jobs will appear here.</p>
                      )}
                    </div>
                  </div>

                  <hr className="border-t border-[#EAE7E2]" />

                  {/* Portfolio */}
                  <PortfolioManager items={profile.portfolioItems} onSave={savePortfolio} />
                </div>

                {/* ── Right sidebar ── */}
                <div className="flex w-full flex-shrink-0 flex-col gap-4 lg:w-[296px]">

                  {/* Hourly Rate card */}
                  <HourlyRateCard
                    hourlyRate={profile.hourlyRate}
                    currency={profile.currency}
                    onSave={saveField("hourlyRate")}
                  />

                  {/* CTA Buttons */}
                  <div className="flex flex-col gap-2 px-0">
                    <button className="w-full rounded-lg bg-gradient-to-r from-orange-600 to-orange-400 px-3 py-3 text-[13px] font-medium uppercase tracking-[0.06em] text-white transition-all hover:opacity-90 hover:-translate-y-[1px]">
                      Hire Now
                    </button>
                    <button className="w-full rounded-lg px-3 py-[11px] text-[13px] font-medium uppercase tracking-[0.06em] text-[#3a3a3a] transition-all bg-[#EAE7E7] hover:border hover:border-[#F5A623]">
                      Invite to Job
                    </button>
                  </div>

                  {/* Meta info */}
                  <div className="rounded-xl border border-[#EAE7E2] bg-white px-5 py-4 flex flex-col gap-4">
                    {[
                      { label: "Response Time", field: "responseTime" as const, placeholder: "e.g. Within 2 hours" },
                      { label: "Availability", field: "availability" as const, placeholder: "e.g. Full-time" },
                    ].map(({ label, field, placeholder }) => (
                      <div key={field}>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#aaa] mb-1">{label}</p>
                        <InlineEdit
                          value={profile[field] as string}
                          placeholder={placeholder}
                          onSave={saveField(field)}
                          displayClassName="text-[12px] font-medium text-[#3a3a3a]"
                        />
                      </div>
                    ))}
                    {profile.lastActive && (
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#aaa] mb-1">Last Active</p>
                        <p className="text-[12px] font-medium text-[#3a3a3a]">{profile.lastActive}</p>
                      </div>
                    )}
                  </div>

                  <LedgerPerformance data={profile.performanceData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
