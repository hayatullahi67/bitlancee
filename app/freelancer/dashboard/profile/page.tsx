// "use client";

// // ─────────────────────────────────────────────────────────────────────────────
// // Freelancer Profile Page
// //
// // Firebase + Cloudinary Integration:
// //   Reads from : freelancers/{uid}  +  all_users/{uid}
// //   Writes to  : freelancers/{uid}  (name/avatar also write to all_users/{uid})
// //   Avatar API : POST /api/avatar/upload   — Bearer token + FormData "file"
// //   Portfolio  : POST /api/portfolio/upload — Bearer token + FormData "file"
// // ─────────────────────────────────────────────────────────────────────────────

// import FreelancerSidebar from "@/components/molecules/FreelancerSidebar";
// import { MapPin, Calendar, BadgeCheck, Edit3, Plus, X, ExternalLink, Loader2 } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import { firebaseAuth, firebaseDb } from "@/lib/firebase";
// import { doc, getDoc, getDocs, collection, query, where, updateDoc, serverTimestamp } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";

// export default function ProfilePage() {

//   // ── state ─────────────────────────────────────────────────────────────────
//   const [loading, setLoading] = useState(true);
//   const [avatarUploading, setAvatarUploading] = useState(false);
//   const [portfolioUploading, setPortfolioUploading] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  
//   const avatarInputRef = useRef<HTMLInputElement>(null);
//   const portfolioItemFileRef = useRef<HTMLInputElement>(null);

//   const [profile, setProfile] = useState({
//     firstName: "",
//     lastName: "",
//     title: "",
//     location: "",
//     memberSince: "",
//     avatarUrl: "",
//     verified: false,
//     hourlyRate: "",
//     totalEarned: "",
//     jobSuccess: 0,
//     jobsCompleted: 0,
//     hoursWorked: 0,
//     responseTime: "",
//     availability: "",
//     bio: "",
//     skills: [] as string[],
//     performanceData: [] as number[],
//     workHistory: [] as Array<{
//       title: string;
//       amount: string;
//       status: string;
//       rating: number;
//       review: string;
//       period: string;
//     }>,
//     portfolioItems: [] as Array<{
//       id: string;
//       title: string;
//       description: string;
//       imageUrl?: string;
//       imagePublicId?: string;
//       projectLink?: string;
//     }>,
//   });

//   // Edit fields temporary states
//   const [editForm, setEditForm] = useState({
//     firstName: "",
//     lastName: "",
//     title: "",
//     location: "",
//     hourlyRate: "",
//     bio: "",
//     skills: "",
//     availability: "",
//     responseTime: "",
//   });

//   // New portfolio item modal state
//   const [newPortfolio, setNewPortfolio] = useState({
//     id: "",
//     title: "",
//     description: "",
//     projectLink: "",
//     file: null as File | null,
//     previewUrl: "",
//     imageUrl: "",
//     imagePublicId: "",
//   });
//   const [portfolioModalMode, setPortfolioModalMode] = useState<'add' | 'edit'>('add');
//   const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
//     show: false,
//     message: '',
//     type: 'success',
//   });
//   const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; itemId: string | null; title: string }>({
//     show: false,
//     itemId: null,
//     title: '',
//   });

//   const resetPortfolioModal = () => {
//     setNewPortfolio({
//       id: "",
//       title: "",
//       description: "",
//       projectLink: "",
//       file: null,
//       previewUrl: "",
//       imageUrl: "",
//       imagePublicId: "",
//     });
//     setPortfolioModalMode('add');
//   };

//   const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
//     setToast({ show: true, message, type });
//     window.setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
//   };

//   const openPortfolioModalForAdd = () => {
//     resetPortfolioModal();
//     setPortfolioModalMode('add');
//     setShowPortfolioModal(true);
//   };

//   const openPortfolioModalForEdit = (item: {
//     id: string;
//     title: string;
//     description: string;
//     projectLink?: string;
//     imageUrl?: string;
//     imagePublicId?: string;
//   }) => {
//     setNewPortfolio({
//       id: item.id,
//       title: item.title,
//       description: item.description,
//       projectLink: item.projectLink ?? "",
//       file: null,
//       previewUrl: item.imageUrl ?? "",
//       imageUrl: item.imageUrl ?? "",
//       imagePublicId: item.imagePublicId ?? "",
//     });
//     setPortfolioModalMode('edit');
//     setShowPortfolioModal(true);
//   };

//   const closePortfolioModal = () => {
//     setShowPortfolioModal(false);
//     resetPortfolioModal();
//   };

//   const handleDeletePortfolio = (portfolioId: string, title: string) => {
//     setDeleteConfirmation({ show: true, itemId: portfolioId, title });
//   };

//   const confirmDeletePortfolio = async () => {
//     if (!deleteConfirmation.itemId) {
//       setDeleteConfirmation({ show: false, itemId: null, title: '' });
//       return;
//     }

//     try {
//       const updatedPortfolioArray = profile.portfolioItems.filter((item) => item.id !== deleteConfirmation.itemId);
//       await saveFreelancer({ portfolioItems: updatedPortfolioArray });
//       setProfile((prev) => ({ ...prev, portfolioItems: updatedPortfolioArray }));
//       triggerToast('Portfolio item deleted successfully.', 'success');
//     } catch (err) {
//       console.error('Failed to delete portfolio item:', err);
//       triggerToast('Failed to delete portfolio item.', 'error');
//     } finally {
//       setDeleteConfirmation({ show: false, itemId: null, title: '' });
//     }
//   };


//   // ── Firebase helpers ───────────────────────────────────────────────────────
//   const saveFreelancer = async (fields: Record<string, unknown>) => {
//     const user = firebaseAuth.currentUser;
//     if (!user) return;
//     await updateDoc(doc(firebaseDb, "freelancers", user.uid), {
//       ...fields,
//       updatedAt: serverTimestamp(),
//     });
//   };

//   const saveAllUsers = async (fields: Record<string, unknown>) => {
//     const user = firebaseAuth.currentUser;
//     if (!user) return;
//     await updateDoc(doc(firebaseDb, "all_users", user.uid), {
//       ...fields,
//       updatedAt: serverTimestamp(),
//     });
//   };

//   // ── Avatar upload ──────────────────────────────────────────────────────────
//   const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const user = firebaseAuth.currentUser;
//     if (!user) { e.target.value = ""; return; }
//     setAvatarUploading(true);
//     try {
//       const idToken = await user.getIdToken();
//       const formData = new FormData();
//       formData.append("file", file);
//       const res = await fetch("/api/avatar/upload", {
//         method: "POST",
//         headers: { Authorization: `Bearer ${idToken}` },
//         body: formData,
//       });
//       const payload = await res.json() as { avatarUrl?: string; avatarPublicId?: string; error?: string };
//       if (!res.ok || !payload.avatarUrl || !payload.avatarPublicId) throw new Error(payload.error || "Upload failed.");
//       const avatarFields = { avatarUrl: payload.avatarUrl, avatarPublicId: payload.avatarPublicId };
//       await Promise.all([saveFreelancer(avatarFields), saveAllUsers(avatarFields)]);
//       setProfile((prev) => ({ ...prev, avatarUrl: payload.avatarUrl! }));
//     } catch (err) {
//       console.error("Avatar upload failed:", err);
//     } finally {
//       setAvatarUploading(false);
//       e.target.value = "";
//     }
//   };

//   // ── Save Profile Fields Change ─────────────────────────────────────────────
//   const handleSaveProfileData = async () => {
//     try {
//       const skillArray = editForm.skills
//         .split(",")
//         .map((s) => s.trim())
//         .filter(Boolean);

//       const fullName = [editForm.firstName, editForm.lastName].filter(Boolean).join(" ").trim();

//       const updatedFields = {
//         firstName: editForm.firstName,
//         lastName: editForm.lastName,
//         title: editForm.title,
//         location: editForm.location,
//         hourlyRate: editForm.hourlyRate,
//         bio: editForm.bio,
//         skills: skillArray,
//         availability: editForm.availability,
//         responseTime: editForm.responseTime,
//       };

//       // 1. Save core data package to the freelancers profile collection
//       await saveFreelancer(updatedFields);
      
//       // 2. Also keep all_users collection aligned with names + full name fields
//       await saveAllUsers({
//         firstName: editForm.firstName,
//         lastName: editForm.lastName,
//         name: fullName,
//         fullName,
//       });

//       setProfile((prev) => ({
//         ...prev,
//         ...updatedFields,
//       }));
//       setIsEditing(false);
//     } catch (err) {
//       console.error("Failed to update profile text data:", err);
//     }
//   };

//   // ── Portfolio Item Upload Workflow ─────────────────────────────────────────
//   const handlePortfolioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setNewPortfolio((prev) => ({
//       ...prev,
//       file,
//       previewUrl: URL.createObjectURL(file),
//     }));
//   };

//   const handleAddPortfolioSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const user = firebaseAuth.currentUser;
//     if (!user || !newPortfolio.title || (!newPortfolio.file && !newPortfolio.imageUrl)) return;

//     setPortfolioUploading(true);
//     try {
//       let finalImgUrl = newPortfolio.imageUrl || "";
//       let finalPublicId = newPortfolio.imagePublicId || crypto.randomUUID();

//       if (newPortfolio.file) {
//         const idToken = await user.getIdToken();
//         const formData = new FormData();
//         formData.append("file", newPortfolio.file);

//         const res = await fetch("/api/portfolio/upload", {
//           method: "POST",
//           headers: { Authorization: `Bearer ${idToken}` },
//           body: formData,
//         });

//         const payload = await res.json() as { imageUrl?: string; url?: string; publicId?: string; avatarPublicId?: string; error?: string };
//         if (!res.ok) throw new Error(payload.error || "Portfolio image upload failed.");

//         finalImgUrl = payload.imageUrl || payload.url || finalImgUrl;
//         finalPublicId = payload.publicId || payload.avatarPublicId || finalPublicId;
//       }

//       const normalizedLink = newPortfolio.projectLink
//         ? newPortfolio.projectLink.startsWith("http")
//           ? newPortfolio.projectLink
//           : `https://${newPortfolio.projectLink}`
//         : "";

//       const portfolioItem = {
//         id: newPortfolio.id || crypto.randomUUID(),
//         title: newPortfolio.title,
//         description: newPortfolio.description,
//         imageUrl: finalImgUrl,
//         imagePublicId: finalPublicId,
//         projectLink: normalizedLink,
//       };

//       const updatedPortfolioArray = newPortfolio.id
//         ? profile.portfolioItems.map((item) => item.id === newPortfolio.id ? portfolioItem : item)
//         : [...profile.portfolioItems, portfolioItem];

//       await saveFreelancer({ portfolioItems: updatedPortfolioArray });
//       setProfile((prev) => ({ ...prev, portfolioItems: updatedPortfolioArray }));
//       closePortfolioModal();
//     } catch (err) {
//       console.error("Portfolio addition failed:", err);
//     } finally {
//       setPortfolioUploading(false);
//     }
//   };

//   // ── Load profile on mount ──────────────────────────────────────────────────
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
//       if (!user) { setLoading(false); return; }
//       try {
//         const [allSnap, freeSnap] = await Promise.all([
//           getDoc(doc(firebaseDb, "all_users", user.uid)),
//           getDoc(doc(firebaseDb, "freelancers", user.uid)),
//         ]);
//         const a = allSnap.exists() ? (allSnap.data() as Record<string, any>) : {};
//         const f = freeSnap.exists() ? (freeSnap.data() as Record<string, any>) : {};

//         // Member since
//         const createdAtRaw = a.createdAt ?? f.createdAt ?? user.metadata.creationTime ?? null;
//         let memberSince = "";
//         if (createdAtRaw) {
//           const d = typeof createdAtRaw.toDate === "function" ? createdAtRaw.toDate() : new Date(createdAtRaw);
//           memberSince = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
//         }

//         // Name Parser
//         const displayParts = (user.displayName ?? "").trim().split(/\s+/).filter(Boolean);
//         const firstName = (f.firstName as string) || (a.firstName as string) || displayParts[0] || "";
//         const lastName  = (f.lastName  as string) || (a.lastName as string) || (displayParts.length > 1 ? displayParts.slice(1).join(" ") : "");

//         const initializedProfile = {
//           firstName,
//           lastName,
//           title:           (f.title           as string) ?? "",
//           location:        (f.location         as string) ?? "",
//           memberSince,
//           avatarUrl:       (f.avatarUrl        as string) ?? (a.avatarUrl as string) ?? "",
//           verified:        (f.verified         as boolean) ?? false,
//           hourlyRate:      (f.hourlyRate        as string) ?? "",
//           totalEarned:     (f.totalEarned       as string) ?? "",
//           jobSuccess:      typeof f.jobSuccess  === "number" ? f.jobSuccess  : 0,
//           jobsCompleted:   typeof f.jobsCompleted === "number" ? f.jobsCompleted : 0,
//           hoursWorked:     typeof f.hoursWorked === "number" ? f.hoursWorked : 0,
//           responseTime:    (f.responseTime      as string) ?? "Within a few hours",
//           availability:    (f.availability      as string) ?? "Available",
//           bio:             (f.bio               as string) ?? "",
//           skills:          Array.isArray(f.skills)          ? f.skills          : [],
//           performanceData: Array.isArray(f.performanceData) ? f.performanceData : [],
//           workHistory:     Array.isArray(f.workHistory)     ? f.workHistory     : [],
//           portfolioItems:  Array.isArray(f.portfolioItems)  ? f.portfolioItems  : [],
//         };

//         setProfile(initializedProfile);
//         setEditForm({
//           firstName: initializedProfile.firstName,
//           lastName: initializedProfile.lastName,
//           title: initializedProfile.title,
//           location: initializedProfile.location,
//           hourlyRate: initializedProfile.hourlyRate,
//           bio: initializedProfile.bio,
//           skills: initializedProfile.skills.join(", "),
//           availability: initializedProfile.availability,
//           responseTime: initializedProfile.responseTime,
//         });

//         // ── Load work history from contracts ─────────────────────────────
//         try {
//           const contractsSnap = await getDocs(
//             query(collection(firebaseDb, "contracts"), where("freelancerId", "==", user.uid))
//           );

//           const formatContractDate = (value: any): string => {
//             if (!value) return "";
//             const d = typeof value.toDate === "function" ? value.toDate() : new Date(value);
//             if (isNaN(d.getTime())) return "";
//             return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
//           };

//           const parseSatsValue = (value: unknown): number => {
//             if (typeof value === "number") return value;
//             const cleaned = String(value ?? "").replace(/[^0-9]/g, "");
//             return cleaned ? Number(cleaned) : 0;
//           };

//           const isFinished = (data: any) =>
//             data.status === "Completed" ||
//             data.paymentStatus === "released" ||
//             data.workStatus === "approved" ||
//             data.workStatus === "completed";

//           const isOngoing = (data: any) =>
//             !isFinished(data) &&
//             (data.paymentStatus === "funded" ||
//               Number(data.escrowFundedTotalSats ?? 0) > 0 ||
//               data.workStatus === "in_progress" ||
//               data.workStatus === "submitted" ||
//               data.workStatus === "changes_requested");

//           const workHistoryFromContracts = contractsSnap.docs
//             .map((d) => {
//               const data = d.data() as any;
//               const amountSats =
//                 typeof data.paymentTotalAmountSats === "number"
//                   ? data.paymentTotalAmountSats
//                   : parseSatsValue(data.budget);
//               const amountLabel = amountSats > 0 ? `${amountSats.toLocaleString()} sats` : data.budget ?? "—";
//               const startStr = formatContractDate(data.startDate);
//               const endStr = formatContractDate(data.dueDate ?? data.updatedAt);
//               const period = startStr && endStr ? `${startStr} – ${endStr}` : startStr || endStr || "";
//               const statusLabel = isFinished(data) ? "COMPLETED" : isOngoing(data) ? "ONGOING" : "ACTIVE";
//               return {
//                 title: data.title ?? "Contract",
//                 amount: amountLabel,
//                 status: statusLabel,
//                 rating: typeof data.rating === "number" ? data.rating : 5,
//                 review: data.clientReview ?? data.review ?? "",
//                 period,
//               };
//             })
//             .sort((a) => (a.status === "COMPLETED" ? -1 : 1));

//           setProfile((prev) => ({ ...prev, workHistory: workHistoryFromContracts }));
//         } catch (err) {
//           console.error("Failed to load work history from contracts:", err);
//         }
//       } catch (err) {
//         console.error("Failed to load profile:", err);
//       } finally {
//         setLoading(false);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   // ── derived ────────────────────────────────────────────────────────────────
//   const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Your Name";
//   const initials = [profile.firstName[0], profile.lastName[0]].filter(Boolean).join("").toUpperCase() || "?";

//   // ── ledger chart helpers ───────────────────────────────────────────────────
//   const maxBar  = profile.performanceData.length ? Math.max(...profile.performanceData) : 1;
//   const peakIdx = profile.performanceData.indexOf(maxBar);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#FCF9F8] flex">
//         <FreelancerSidebar active="/freelancer/dashboard/profile" />
//         <div className="flex-1 flex items-center justify-center">
//           <div className="h-8 w-8 rounded-full border-2 border-[#F7931A] border-t-transparent animate-spin" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#FCF9F8]">
//       <div className="flex">

//         {/* Sidebar */}
//         <FreelancerSidebar active="/freelancer/dashboard/profile" />

//         {/* Hidden avatar file input */}
//         <input
//           ref={avatarInputRef}
//           type="file"
//           accept="image/png,image/jpeg,image/webp"
//           className="hidden"
//           onChange={handleAvatarChange}
//         />

//         {/* ── Page content ──────────────────────────────────────────────── */}
//         <div className="flex-1 min-w-0 pt-14 md:pt-0">
//           <div className="px-3 sm:px-5 lg:px-8 py-6 sm:py-8">

//             {/* CONTAINER */}
//             <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">

//               {/* HERO SECTION */}
//               <div className="flex flex-col lg:flex-row gap-5">

//                 {/* DIV-LEFT */}
//                 <div className="flex-1 min-w-0 flex flex-col gap-4">

//                   {/* Avatar + name block */}
//                   <div className="flex flex-col sm:flex-row items-start gap-4">

//                     {/* Avatar */}
//                     <div
//                       onClick={() => !avatarUploading && avatarInputRef.current?.click()}
//                       className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] flex-shrink-0 rounded-[12px] overflow-hidden bg-[#E8E2D9] border border-[#DDD8D0] cursor-pointer relative group"
//                     >
//                       {profile.avatarUrl ? (
//                         <img src={profile.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center text-[26px] font-black text-[#8C4F00]">
//                           {initials}
//                         </div>
//                       )}
//                       <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wide">
//                         {avatarUploading ? "Uploading…" : "Change"}
//                       </div>
//                     </div>

//                     {/* Name / title / meta */}
//                     <div className="flex-1 min-w-0 w-full">

//                       {/* Name row — Conditional Rendering for Editing States */}
//                       <div className="flex items-start gap-2 flex-wrap w-full">
//                         {isEditing ? (
//                           <div className="flex gap-2 w-full max-w-xl mt-1">
//                             <input
//                               type="text"
//                               value={editForm.firstName}
//                               onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
//                               className="px-3 py-1.5 text-[16px] sm:text-[20px] font-black w-1/2 border border-[#DDD8D0] rounded-[8px] bg-white text-[#0f0f0f] focus:outline-none focus:border-[#F7931A]"
//                               placeholder="First Name"
//                             />
//                             <input
//                               type="text"
//                               value={editForm.lastName}
//                               onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
//                               className="px-3 py-1.5 text-[16px] sm:text-[20px] font-black w-1/2 border border-[#DDD8D0] rounded-[8px] bg-white text-[#0f0f0f] focus:outline-none focus:border-[#F7931A]"
//                               placeholder="Last Name"
//                             />
//                           </div>
//                         ) : (
//                           <>
//                             <h1 className="text-[26px] break-words md:w-[290px] sm:text-[34px] lg:text-[40px] font-black text-[#0f0f0f] ">
//                               {fullName}
//                             </h1>
//                             {profile.verified && (
//                               <BadgeCheck size={20} className="flex-shrink-0 mt-1.5 text-[#3B82F6]" />
//                             )}
//                           </>
//                         )}
//                       </div>

//                       {/* Title Form Field */}
//                       {isEditing ? (
//                         <input
//                           type="text"
//                           value={editForm.title}
//                           onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
//                           className="mt-2 px-3 py-1.5 text-[14px] w-full max-w-xl border border-[#DDD8D0] rounded-[8px] bg-white font-medium text-[#1a1a1a] focus:outline-none focus:border-[#F7931A]"
//                           placeholder="Professional Title"
//                         />
//                       ) : (
//                         <p className="mt-1 text-[14px] sm:text-[16px] text-[#555] font-medium leading-snug">
//                           {profile.title || "No title set"}
//                         </p>
//                       )}

//                       {/* Location + member since */}
//                       <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-[#888] font-medium uppercase tracking-[0.08em]">
//                         {isEditing ? (
//                           <div className="flex items-center gap-1 w-full max-w-xs">
//                             <MapPin size={10} />
//                             <input
//                               type="text"
//                               value={editForm.location}
//                               onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
//                               className="px-2 py-1 text-[11px] w-full border border-[#DDD8D0] rounded bg-white focus:outline-none focus:border-[#F7931A]"
//                               placeholder="Location"
//                             />
//                           </div>
//                         ) : (
//                           profile.location && (
//                             <span className="flex items-center gap-1">
//                               <MapPin size={10} />
//                               {profile.location}
//                             </span>
//                           )
//                         )}
//                         {profile.memberSince && (
//                           <span className="flex items-center gap-1">
//                             <Calendar size={10} />
//                             Member since {profile.memberSince}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Stats bar */}
//                   <div className="bg-[#EDEAE5] rounded-[12px] px-4 md:mt-[40px] sm:px-6 py-4 sm:py-5 flex flex-wrap gap-x-6 sm:gap-x-10 gap-y-3">
//                     <div>
//                       <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Total Earned</p>
//                       <p className="text-[16px] sm:text-[18px] font-black text-[#8C4F00] leading-none">
//                         {profile.totalEarned || 0}
//                         <span className="text-[11px] font-bold ml-1">Sats</span>
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Job Success</p>
//                       <p className="text-[16px] sm:text-[18px] font-black text-[#1a1a1a] leading-none">
//                         {profile.jobSuccess}<span className="text-[11px] font-bold ml-0.5">%</span>
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Jobs Completed</p>
//                       <p className="text-[16px] sm:text-[18px] font-black text-[#1a1a1a] leading-none">
//                         {profile.jobsCompleted}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Hours Worked</p>
//                       <p className="text-[16px] sm:text-[18px] font-black text-[#1a1a1a] leading-none">
//                         {profile.hoursWorked.toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* DIV-RIGHT — Action Cards Section */}
//                 <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0">
//                   <div className="bg-white rounded-[16px] p-5 sm:p-6 flex flex-col gap-4 border border-[#EDEAE5]">

//                     {/* Hourly Rate */}
//                     <div>
//                       <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Hourly Rate</p>
//                       <div className="flex items-baseline gap-1">
//                         {isEditing ? (
//                           <div className="flex items-center gap-1 w-full">
//                             <input
//                               type="text"
//                               value={editForm.hourlyRate}
//                               onChange={(e) => setEditForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
//                               className="px-2 py-1 text-[18px] w-32 font-black border border-[#DDD8D0] rounded bg-white focus:outline-none focus:border-[#F7931A]"
//                               placeholder="3000"
//                             />
//                             <span className="text-[12px] font-bold text-[#999]">sats/hr</span>
//                           </div>
//                         ) : (
//                           <>
//                             <span className="text-[28px] sm:text-[32px] font-black text-[#1a1a1a] tracking-tight leading-none">
//                               {profile.hourlyRate || "—"}
//                             </span>
//                             <span className="text-[12px] font-bold text-[#999]">sats/hr</span>
//                           </>
//                         )}
//                       </div>
//                     </div>

//                     {/* Action Buttons Toggle */}
//                     {!isEditing ? (
//                       <button 
//                         onClick={() => setIsEditing(true)}
//                         className="w-full py-3 rounded-[10px] bg-[#F7931A] hover:bg-[#E07D0A] text-[13px] sm:text-[14px] font-black text-white tracking-wide transition-colors flex items-center justify-center gap-2"
//                       >
//                         <Edit3 size={16} />
//                         Edit Profile
//                       </button>
//                     ) : (
//                       <div className="flex flex-col gap-2">
//                         <button 
//                           onClick={handleSaveProfileData}
//                           className="w-full py-2.5 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-[13px] font-black text-white tracking-wide transition-colors"
//                         >
//                           Save Changes
//                         </button>
//                         <button 
//                           onClick={() => {
//                             setIsEditing(false);
//                             setEditForm({
//                               firstName: profile.firstName,
//                               lastName: profile.lastName,
//                               title: profile.title,
//                               location: profile.location,
//                               hourlyRate: profile.hourlyRate,
//                               bio: profile.bio,
//                               skills: profile.skills.join(", "),
//                               availability: profile.availability,
//                               responseTime: profile.responseTime,
//                             });
//                           }}
//                           className="w-full py-2.5 rounded-[10px] bg-[#EDEAE5] hover:bg-[#E0DDD8] text-[13px] font-black text-[#1a1a1a] tracking-wide transition-colors border border-[#DDD8D0]"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     )}

//                     <div className="border-t border-[#F0EDE8]" />

//                     {/* Response Time & Availability */}
//                     <div className="flex flex-col gap-3">
//                       <div className="flex flex-col gap-1">
//                         <span className="text-[11px] font-black uppercase tracking-wider text-[#999]">Response Time</span>
//                         {isEditing ? (
//                           <select
//                             value={editForm.responseTime}
//                             onChange={(e) => setEditForm(prev => ({ ...prev, responseTime: e.target.value }))}
//                             className="w-full px-2 py-1.5 text-[12px] font-bold border border-[#DDD8D0] rounded bg-white text-[#1a1a1a] focus:outline-none focus:border-[#F7931A]"
//                           >
//                             <option value="Within an hour">Within an hour</option>
//                             <option value="Within a few hours">Within a few hours</option>
//                             <option value="Within a day">Within a day</option>
//                             <option value="Asynchronous">Asynchronous</option>
//                           </select>
//                         ) : (
//                           <span className="text-[13px] font-bold text-[#1a1a1a]">{profile.responseTime}</span>
//                         )}
//                       </div>

//                       <div className="flex flex-col gap-1">
//                         <span className="text-[11px] font-black uppercase tracking-wider text-[#999]">Availability</span>
//                         {isEditing ? (
//                           <select
//                             value={editForm.availability}
//                             onChange={(e) => setEditForm(prev => ({ ...prev, availability: e.target.value }))}
//                             className="w-full px-2 py-1.5 text-[12px] font-bold border border-[#DDD8D0] rounded bg-white text-[#1a1a1a] focus:outline-none focus:border-[#F7931A]"
//                           >
//                             <option value="Available">Available</option>
//                             <option value="Full Time">Full Time</option>
//                             <option value="Part Time">Part Time</option>
//                             <option value="Busy / Booked">Busy / Booked</option>
//                           </select>
//                         ) : (
//                           <span className="text-[13px] font-bold text-[#1a1a1a]">{profile.availability}</span>
//                         )}
//                       </div>
//                     </div>

//                   </div>
//                 </div>

//               </div>

//               {/* BIO / EXPERTISE / CHART SECTION */}
//               <div className="flex flex-col lg:flex-row gap-5">
//                 <div className="w-full lg:flex-1 min-w-0 flex flex-col sm:flex-row gap-6 sm:gap-8">
                  
//                   {/* Bio */}
//                   <div className="flex-1 min-w-0">
//                     <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F7931A] mb-3">
//                       Professional Bio
//                     </p>
//                     {isEditing ? (
//                       <textarea
//                         value={editForm.bio}
//                         onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
//                         rows={5}
//                         className="w-full p-3 text-[13px] border border-[#DDD8D0] rounded-[8px] bg-white text-[#444] leading-[1.8] focus:outline-none focus:border-[#F7931A]"
//                         placeholder="Write your professional overview bio..."
//                       />
//                     ) : (
//                       <div className="text-[13px] sm:text-[14px] text-[#444] leading-[1.8] whitespace-pre-line">
//                         {profile.bio || "No professional overview bio configured yet."}
//                       </div>
//                     )}
//                   </div>

//                   {/* Core Expertise */}
//                   <div className="w-full sm:w-[220px] flex-shrink-0">
//                     <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F7931A] mb-3">
//                       Core Expertise
//                     </p>
//                     {isEditing ? (
//                       <div className="flex flex-col gap-1.5">
//                         <input
//                           type="text"
//                           value={editForm.skills}
//                           onChange={(e) => setEditForm(prev => ({ ...prev, skills: e.target.value }))}
//                           className="px-2 py-1.5 text-[12px] w-full border border-[#DDD8D0] rounded bg-white text-[#2a2a2a] focus:outline-none focus:border-[#F7931A]"
//                           placeholder="Next.js, Bitcoin, LND (comma separated)"
//                         />
//                         <span className="text-[9px] text-[#999]">Separate with commas</span>
//                       </div>
//                     ) : (
//                       <div className="flex flex-wrap gap-2">
//                         {profile.skills.length > 0 ? profile.skills.map((skill) => (
//                           <span
//                             key={skill}
//                             className="px-3 py-2 rounded-[4px] bg-[#E8E5E0] text-[10px] font-black uppercase tracking-[0.1em] text-[#2a2a2a]"
//                           >
//                             {skill}
//                           </span>
//                         )) : (
//                           <span className="text-[12px] text-[#999] italic">No expertise skills added</span>
//                         )}
//                       </div>
//                     )}
//                   </div>

//                 </div>

//                 {/* Ledger Performance chart */}
//                 <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0">
//                   <div className="bg-[#1a1a1a] rounded-[14px] p-4 sm:p-5 h-full min-h-[160px] flex flex-col justify-between">
//                     <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#666] mb-3">
//                       Ledger Performance
//                     </p>
//                     <div className="flex items-end gap-[5px] sm:gap-[6px] h-[60px] sm:h-[70px] relative">
//                       {profile.performanceData.map((val, i) => {
//                         const isPeak   = i === peakIdx;
//                         const heightPct = Math.round((val / maxBar) * 100);
//                         return (
//                           <div key={i} className="flex-1 flex flex-col items-center justify-end relative">
//                             {isPeak && (
//                               <span className="absolute -top-5 text-[7px] font-black uppercase tracking-widest bg-[#F7931A] text-black px-1.5 py-0.5 rounded-[3px] whitespace-nowrap">
//                                 PEAK
//                               </span>
//                             )}
//                             <div
//                               className={`w-full rounded-t-[3px] transition-all ${
//                                 isPeak ? "bg-[#F7931A]" : "bg-[rgba(247,147,26,0.25)]"
//                               }`}
//                               style={{ height: `${heightPct}%` }}
//                             />
//                           </div>
//                         );
//                       })}
//                     </div>
//                     <p className="mt-3 text-[8px] sm:text-[9px] text-[#555] leading-[1.5]">
//                       Top 1% Engineering Performance Index. High reliability in mission-critical deployments.
//                     </p>
//                   </div>
//                 </div>

//               </div>

//               {/* WORK HISTORY SECTION */}
//               <div className="lg:w-[70%]">
//                 <div>
//                   <div className="flex items-center justify-between mb-4">
//                     <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F7931A]">
//                       Work History
//                     </p>
//                     <p className="text-[11px] sm:text-[12px] text-[#999]">
//                       Showing latest {profile.workHistory.length} of {profile.jobsCompleted}
//                     </p>
//                   </div>

//                   <div className="flex flex-col gap-4">
//                     {profile.workHistory.length > 0 ? profile.workHistory.map((job, i) => (
//                       <div key={i} className="bg-white rounded-[12px] border border-[#EDEAE5] px-4 sm:px-6 py-4 sm:py-5">
//                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
//                           <h3 className="text-[14px] sm:text-[15px] font-bold text-[#1a1a1a]">{job.title}</h3>
//                           <div className="flex items-center gap-2 flex-shrink-0">
//                             <span className="text-[12px] sm:text-[13px] font-semibold text-[#1a1a1a]">{job.amount}</span>
//                             <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[#3B82F6] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
//                               {job.status}
//                             </span>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-1 mb-2">
//                           {[1,2,3,4,5].map((s) => (
//                             <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= job.rating ? "#F7931A" : "#DDD"}>
//                               <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
//                             </svg>
//                           ))}
//                           <span className="ml-1 text-[12px] font-bold text-[#F7931A]">{job.rating.toFixed(1)}</span>
//                         </div>
//                         {job.review && (
//                           <p className="text-[12px] sm:text-[13px] italic text-[#555] leading-[1.6] mb-2">"{job.review}"</p>
//                         )}
//                         {job.period && <p className="text-[11px] text-[#AAA]">{job.period}</p>}
//                       </div>
//                     )) : (
//                       <p className="text-[13px] text-[#999] italic">No work history yet — completed jobs will appear here.</p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* PORTFOLIO SECTION */}
//               <div className="lg:w-[70%] pb-8">
//                 <div className="flex items-center justify-between mb-4">
//                   <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F7931A]">
//                     Portfolio
//                   </p>
//                   <button 
//                     onClick={openPortfolioModalForAdd}
//                     className="px-3 py-1.5 rounded-[6px] bg-[#F7931A] hover:bg-[#E07D0A] text-[11px] font-black text-white uppercase tracking-wider transition-colors flex items-center gap-1"
//                   >
//                     <Plus size={12} />
//                     Add Item
//                   </button>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   {profile.portfolioItems.length > 0 ? profile.portfolioItems.map((item) => (
//                     <div
//                       key={item.id}
//                       className="aspect-[16/10] rounded-[10px] overflow-hidden bg-[#1a1a1a] relative group border border-[#EDEAE5]"
//                     >
//                       {item.imageUrl ? (
//                         <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
//                       ) : (
//                         <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#2d1a00] flex items-center justify-center">
//                           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(247,147,26,0.4)" strokeWidth="1">
//                             <rect x="3" y="3" width="18" height="18" rx="2" />
//                             <circle cx="8.5" cy="8.5" r="1.5" />
//                             <polyline points="21 15 16 10 5 21" />
//                           </svg>
//                         </div>
//                       )}

//                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

//                       <div className="absolute top-3 right-3 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                         <button
//                           type="button"
//                           onClick={() => openPortfolioModalForEdit(item)}
//                           className="rounded-full bg-white/90 px-2 py-1 text-[11px] font-black text-[#1a1a1a] hover:bg-white"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => handleDeletePortfolio(item.id, item.title)}
//                           className="rounded-full bg-[#F7931A] px-2 py-1 text-[11px] font-black text-white hover:bg-[#e07d0a]"
//                         >
//                           Delete
//                         </button>
//                       </div>

//                       <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-1">
//                         {item.title && (
//                           <p className="text-white text-[14px] font-black flex items-center gap-1.5">
//                             {item.title}
//                             {item.projectLink && <ExternalLink size={12} className="text-[#F7931A]" />}
//                           </p>
//                         )}
//                         {item.description && (
//                           <p className="text-[#CCC] text-[11px] line-clamp-2 font-medium leading-relaxed">
//                             {item.description}
//                           </p>
//                         )}
//                       </div>

//                       {item.projectLink ? (
//                         <a
//                           href={item.projectLink}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="absolute inset-0 z-0"
//                           aria-label={`Open ${item.title || 'project'} link`}
//                         />
//                       ) : null}
//                     </div>
//                   )) : (
//                     <p className="text-[13px] text-[#999] italic col-span-2">No portfolio items yet. Add showcase projects above.</p>
//                   )}
//                 </div>
//               </div>

//             </div>

//           </div>
//         </div>

//       </div>

//       {/* ── MODAL COMPONENT — ADD PORTFOLIO ITEM ──────────────────────────────── */}
//       {showPortfolioModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-xs">
//           <div className="bg-white w-full max-w-md h-[90vh] flex flex-col rounded-[16px] overflow-hidden shadow-xl border border-[#EDEAE5] animate-in fade-in zoom-in-95 duration-200">
            
//             <div className="px-5 py-4 bg-[#FCF9F8] border-b border-[#EDEAE5] flex items-center justify-between flex-shrink-0">
//               <h3 className="text-[14px] font-black uppercase tracking-wider text-[#1a1a1a]">
//                 {portfolioModalMode === 'edit' ? 'Edit Portfolio Case' : 'Add Portfolio Case'}
//               </h3>
//               <button 
//                 type="button"
//                 onClick={() => {
//                   if (!portfolioUploading) {
//                     closePortfolioModal();
//                   }
//                 }}
//                 className="text-[#999] hover:text-[#1a1a1a] transition-colors"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             <form onSubmit={handleAddPortfolioSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
//               <div>
//                 <label className="block text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Project Mockup Image</label>
//                 <input 
//                   type="file" 
//                   ref={portfolioItemFileRef}
//                   accept="image/png,image/jpeg,image/webp"
//                   className="hidden"
//                   onChange={handlePortfolioFileSelect}
//                 />
//                 {newPortfolio.previewUrl ? (
//                   <div className="relative aspect-[16/9] w-full rounded-[8px] overflow-hidden border border-[#DDD8D0]">
//                     <img src={newPortfolio.previewUrl} alt="Preview" className="w-full h-full object-cover" />
//                     <button 
//                       type="button"
//                       onClick={() => setNewPortfolio(prev => ({ ...prev, file: null, previewUrl: "" }))}
//                       className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
//                     >
//                       <X size={14} />
//                     </button>
//                   </div>
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={() => portfolioItemFileRef.current?.click()}
//                     className="w-full aspect-[16/9] border-2 border-dashed border-[#DDD8D0] hover:border-[#F7931A] rounded-[8px] flex flex-col items-center justify-center gap-2 bg-[#FCF9F8] text-[#888] hover:text-[#F7931A] transition-colors text-[12px] font-medium"
//                   >
//                     <Plus size={20} />
//                     Upload Project Graphic
//                   </button>
//                 )}
//               </div>

//               {/* Title */}
//               <div>
//                 <label className="block text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Project Title</label>
//                 <input 
//                   type="text"
//                   value={newPortfolio.title}
//                   onChange={(e) => setNewPortfolio(prev => ({ ...prev, title: e.target.value }))}
//                   required
//                   placeholder="e.g., Lightning Vault Protocol"
//                   className="w-full px-3 py-2 text-[13px] border border-[#DDD8D0] rounded-[6px] focus:outline-none focus:border-[#F7931A]"
//                 />
//               </div>

//               {/* Destination Link */}
//               <div>
//                 <label className="block text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Project Web URL Link</label>
//                 <input 
//                   type="text"
//                   value={newPortfolio.projectLink}
//                   onChange={(e) => setNewPortfolio(prev => ({ ...prev, projectLink: e.target.value }))}
//                   required
//                   placeholder="e.g., github.com/user/project or website.com"
//                   className="w-full px-3 py-2 text-[13px] border border-[#DDD8D0] rounded-[6px] focus:outline-none focus:border-[#F7931A]"
//                 />
//               </div>

//               {/* Description */}
//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <label className="text-[9px] font-black uppercase tracking-[0.12em] text-[#999]">Short Description</label>
//                   <span className={`text-[10px] font-bold ${newPortfolio.description.length >= 150 ? 'text-red-500' : 'text-[#888]'}`}>
//                     {newPortfolio.description.length}/150
//                   </span>
//                 </div>
//                 <textarea 
//                   value={newPortfolio.description}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     if (value.length <= 150) {
//                       setNewPortfolio(prev => ({ ...prev, description: value }));
//                     }
//                   }}
//                   required
//                   rows={3}
//                   placeholder="Max 150 characters overview description of what you engineered..."
//                   className="w-full px-3 py-2 text-[13px] border border-[#DDD8D0] rounded-[6px] focus:outline-none focus:border-[#F7931A] resize-none"
//                 />
//               </div>

//               {/* Submit Buttons */}
//               <div className="flex items-center gap-3 mt-auto pt-2 flex-shrink-0">
//                 <button
//                   type="submit"
//                   disabled={portfolioUploading}
//                   className="flex-1 py-2.5 rounded-[8px] bg-[#F7931A] hover:bg-[#E07D0A] disabled:bg-amber-400 text-[13px] font-black text-white uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
//                 >
//                   {portfolioUploading ? (
//                     <>
//                       <Loader2 size={14} className="animate-spin" />
//                       Uploading...
//                     </>
//                   ) : (
//                     portfolioModalMode === 'edit' ? 'Update Project' : 'Save Project'
//                   )}
//                 </button>
//                 <button
//                   type="button"
//                   disabled={portfolioUploading}
//                   onClick={() => {
//                     if (!portfolioUploading) {
//                       closePortfolioModal();
//                     }
//                   }}
//                   className="px-4 py-2.5 rounded-[8px] border border-[#DDD8D0] bg-white text-[13px] font-bold text-[#555] hover:bg-[#FCF9F8] transition-colors"
//                 >
//                   Cancel
//                 </button>
//               </div>

//             </form>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }


"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Freelancer Profile Page
//
// Firebase + Cloudinary Integration:
//   Reads from : freelancers/{uid}  +  all_users/{uid}
//   Writes to  : freelancers/{uid}  (name/avatar also write to all_users/{uid})
//   Avatar API : POST /api/avatar/upload   — Bearer token + FormData "file"
//   Portfolio  : POST /api/portfolio/upload — Bearer token + FormData "file"
// ─────────────────────────────────────────────────────────────────────────────

import FreelancerSidebar from "@/components/molecules/FreelancerSidebar";
import { MapPin, Calendar, BadgeCheck, Edit3, Plus, X, ExternalLink, Loader2, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { doc, getDoc, getDocs, collection, query, where, updateDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfilePage() {

  // ── state ─────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portfolioItemFileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    title: "",
    location: "",
    memberSince: "",
    avatarUrl: "",
    verified: false,
    hourlyRate: "",
    totalEarned: "",
    jobSuccess: 0,
    jobsCompleted: 0,
    hoursWorked: 0,
    responseTime: "",
    availability: "",
    bio: "",
    skills: [] as string[],
    performanceData: [] as number[],
    workHistory: [] as Array<{
      title: string;
      amount: string;
      status: string;
      rating: number;
      review: string;
      period: string;
    }>,
    portfolioItems: [] as Array<{
      id: string;
      title: string;
      description: string;
      imageUrl?: string;
      imagePublicId?: string;
      projectLink?: string;
    }>,
  });

  // Edit fields temporary states
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    title: "",
    location: "",
    hourlyRate: "",
    bio: "",
    skills: "",
    availability: "",
    responseTime: "",
  });

  // New portfolio item modal state
  const [newPortfolio, setNewPortfolio] = useState({
    id: "",
    title: "",
    description: "",
    projectLink: "",
    file: null as File | null,
    previewUrl: "",
    imageUrl: "",
    imagePublicId: "",
  });
  const [portfolioModalMode, setPortfolioModalMode] = useState<'add' | 'edit'>('add');

  // ── Toast State ───────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  // ── Delete Confirmation State ─────────────────────────────────────────────
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; itemId: string | null; title: string; isDeleting: boolean }>({
    show: false,
    itemId: null,
    title: '',
    isDeleting: false,
  });

  const resetPortfolioModal = () => {
    setNewPortfolio({
      id: "",
      title: "",
      description: "",
      projectLink: "",
      file: null,
      previewUrl: "",
      imageUrl: "",
      imagePublicId: "",
    });
    setPortfolioModalMode('add');
  };

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    window.setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const openPortfolioModalForAdd = () => {
    resetPortfolioModal();
    setPortfolioModalMode('add');
    setShowPortfolioModal(true);
  };

  const openPortfolioModalForEdit = (item: {
    id: string;
    title: string;
    description: string;
    projectLink?: string;
    imageUrl?: string;
    imagePublicId?: string;
  }) => {
    setNewPortfolio({
      id: item.id,
      title: item.title,
      description: item.description,
      projectLink: item.projectLink ?? "",
      file: null,
      previewUrl: item.imageUrl ?? "",
      imageUrl: item.imageUrl ?? "",
      imagePublicId: item.imagePublicId ?? "",
    });
    setPortfolioModalMode('edit');
    setShowPortfolioModal(true);
  };

  const closePortfolioModal = () => {
    setShowPortfolioModal(false);
    resetPortfolioModal();
  };

  const handleDeletePortfolio = (portfolioId: string, title: string) => {
    setDeleteConfirmation({ show: true, itemId: portfolioId, title, isDeleting: false });
  };

  const confirmDeletePortfolio = async () => {
    if (!deleteConfirmation.itemId) {
      setDeleteConfirmation({ show: false, itemId: null, title: '', isDeleting: false });
      return;
    }

    setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));

    try {
      const updatedPortfolioArray = profile.portfolioItems.filter((item) => item.id !== deleteConfirmation.itemId);
      await saveFreelancer({ portfolioItems: updatedPortfolioArray });
      setProfile((prev) => ({ ...prev, portfolioItems: updatedPortfolioArray }));
      setDeleteConfirmation({ show: false, itemId: null, title: '', isDeleting: false });
      triggerToast('Portfolio item deleted successfully.', 'success');
    } catch (err) {
      console.error('Failed to delete portfolio item:', err);
      setDeleteConfirmation(prev => ({ ...prev, isDeleting: false }));
      triggerToast('Failed to delete portfolio item. Please try again.', 'error');
    }
  };

  const cancelDelete = () => {
    if (deleteConfirmation.isDeleting) return;
    setDeleteConfirmation({ show: false, itemId: null, title: '', isDeleting: false });
  };

  // ── Firebase helpers ───────────────────────────────────────────────────────
  const saveFreelancer = async (fields: Record<string, unknown>) => {
    const user = firebaseAuth.currentUser;
    if (!user) return;
    await updateDoc(doc(firebaseDb, "freelancers", user.uid), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
  };

  const saveAllUsers = async (fields: Record<string, unknown>) => {
    const user = firebaseAuth.currentUser;
    if (!user) return;
    await updateDoc(doc(firebaseDb, "all_users", user.uid), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
  };

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const user = firebaseAuth.currentUser;
    if (!user) { e.target.value = ""; return; }
    setAvatarUploading(true);
    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/avatar/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });
      const payload = await res.json() as { avatarUrl?: string; avatarPublicId?: string; error?: string };
      if (!res.ok || !payload.avatarUrl || !payload.avatarPublicId) throw new Error(payload.error || "Upload failed.");
      const avatarFields = { avatarUrl: payload.avatarUrl, avatarPublicId: payload.avatarPublicId };
      await Promise.all([saveFreelancer(avatarFields), saveAllUsers(avatarFields)]);
      setProfile((prev) => ({ ...prev, avatarUrl: payload.avatarUrl! }));
      triggerToast('Avatar updated successfully.', 'success');
    } catch (err) {
      console.error("Avatar upload failed:", err);
      triggerToast('Avatar upload failed. Please try again.', 'error');
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  // ── Save Profile Fields Change ─────────────────────────────────────────────
  const handleSaveProfileData = async () => {
    try {
      const skillArray = editForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const fullName = [editForm.firstName, editForm.lastName].filter(Boolean).join(" ").trim();

      const updatedFields = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        title: editForm.title,
        location: editForm.location,
        hourlyRate: editForm.hourlyRate,
        bio: editForm.bio,
        skills: skillArray,
        availability: editForm.availability,
        responseTime: editForm.responseTime,
      };

      await saveFreelancer(updatedFields);
      await saveAllUsers({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        name: fullName,
        fullName,
      });

      setProfile((prev) => ({
        ...prev,
        ...updatedFields,
      }));
      setIsEditing(false);
      triggerToast('Profile updated successfully.', 'success');
    } catch (err) {
      console.error("Failed to update profile text data:", err);
      triggerToast('Failed to save profile. Please try again.', 'error');
    }
  };

  // ── Portfolio Item Upload Workflow ─────────────────────────────────────────
  const handlePortfolioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPortfolio((prev) => ({
      ...prev,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
  };

  const handleAddPortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = firebaseAuth.currentUser;
    if (!user || !newPortfolio.title || (!newPortfolio.file && !newPortfolio.imageUrl)) return;

    setPortfolioUploading(true);
    try {
      let finalImgUrl = newPortfolio.imageUrl || "";
      let finalPublicId = newPortfolio.imagePublicId || crypto.randomUUID();

      if (newPortfolio.file) {
        const idToken = await user.getIdToken();
        const formData = new FormData();
        formData.append("file", newPortfolio.file);

        const res = await fetch("/api/portfolio/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}` },
          body: formData,
        });

        const payload = await res.json() as { imageUrl?: string; url?: string; publicId?: string; avatarPublicId?: string; error?: string };
        if (!res.ok) throw new Error(payload.error || "Portfolio image upload failed.");

        finalImgUrl = payload.imageUrl || payload.url || finalImgUrl;
        finalPublicId = payload.publicId || payload.avatarPublicId || finalPublicId;
      }

      const normalizedLink = newPortfolio.projectLink
        ? newPortfolio.projectLink.startsWith("http")
          ? newPortfolio.projectLink
          : `https://${newPortfolio.projectLink}`
        : "";

      const portfolioItem = {
        id: newPortfolio.id || crypto.randomUUID(),
        title: newPortfolio.title,
        description: newPortfolio.description,
        imageUrl: finalImgUrl,
        imagePublicId: finalPublicId,
        projectLink: normalizedLink,
      };

      const updatedPortfolioArray = newPortfolio.id
        ? profile.portfolioItems.map((item) => item.id === newPortfolio.id ? portfolioItem : item)
        : [...profile.portfolioItems, portfolioItem];

      await saveFreelancer({ portfolioItems: updatedPortfolioArray });
      setProfile((prev) => ({ ...prev, portfolioItems: updatedPortfolioArray }));
      closePortfolioModal();
      triggerToast(
        portfolioModalMode === 'edit' ? 'Portfolio item updated.' : 'Portfolio item added.',
        'success'
      );
    } catch (err) {
      console.error("Portfolio addition failed:", err);
      triggerToast('Failed to save portfolio item. Please try again.', 'error');
    } finally {
      setPortfolioUploading(false);
    }
  };

  // ── Load profile on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) { setLoading(false); return; }
      try {
        const [allSnap, freeSnap] = await Promise.all([
          getDoc(doc(firebaseDb, "all_users", user.uid)),
          getDoc(doc(firebaseDb, "freelancers", user.uid)),
        ]);
        const a = allSnap.exists() ? (allSnap.data() as Record<string, any>) : {};
        const f = freeSnap.exists() ? (freeSnap.data() as Record<string, any>) : {};

        // Member since
        const createdAtRaw = a.createdAt ?? f.createdAt ?? user.metadata.creationTime ?? null;
        let memberSince = "";
        if (createdAtRaw) {
          const d = typeof createdAtRaw.toDate === "function" ? createdAtRaw.toDate() : new Date(createdAtRaw);
          memberSince = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        }

        // Name Parser
        const displayParts = (user.displayName ?? "").trim().split(/\s+/).filter(Boolean);
        const firstName = (f.firstName as string) || (a.firstName as string) || displayParts[0] || "";
        const lastName  = (f.lastName  as string) || (a.lastName as string) || (displayParts.length > 1 ? displayParts.slice(1).join(" ") : "");

        const initializedProfile = {
          firstName,
          lastName,
          title:           (f.title           as string) ?? "",
          location:        (f.location         as string) ?? "",
          memberSince,
          avatarUrl:       (f.avatarUrl        as string) ?? (a.avatarUrl as string) ?? "",
          verified:        (f.verified         as boolean) ?? false,
          hourlyRate:      (f.hourlyRate        as string) ?? "",
          totalEarned:     (f.totalEarned       as string) ?? "",
          jobSuccess:      typeof f.jobSuccess  === "number" ? f.jobSuccess  : 0,
          jobsCompleted:   typeof f.jobsCompleted === "number" ? f.jobsCompleted : 0,
          hoursWorked:     typeof f.hoursWorked === "number" ? f.hoursWorked : 0,
          responseTime:    (f.responseTime      as string) ?? "Within a few hours",
          availability:    (f.availability      as string) ?? "Available",
          bio:             (f.bio               as string) ?? "",
          skills:          Array.isArray(f.skills)          ? f.skills          : [],
          performanceData: Array.isArray(f.performanceData) ? f.performanceData : [],
          workHistory:     Array.isArray(f.workHistory)     ? f.workHistory     : [],
          portfolioItems:  Array.isArray(f.portfolioItems)  ? f.portfolioItems  : [],
        };

        setProfile(initializedProfile);
        setEditForm({
          firstName: initializedProfile.firstName,
          lastName: initializedProfile.lastName,
          title: initializedProfile.title,
          location: initializedProfile.location,
          hourlyRate: initializedProfile.hourlyRate,
          bio: initializedProfile.bio,
          skills: initializedProfile.skills.join(", "),
          availability: initializedProfile.availability,
          responseTime: initializedProfile.responseTime,
        });

        // ── Load work history from contracts ─────────────────────────────
        try {
          const contractsSnap = await getDocs(
            query(collection(firebaseDb, "contracts"), where("freelancerId", "==", user.uid))
          );

          const formatContractDate = (value: any): string => {
            if (!value) return "";
            const d = typeof value.toDate === "function" ? value.toDate() : new Date(value);
            if (isNaN(d.getTime())) return "";
            return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
          };

          const parseSatsValue = (value: unknown): number => {
            if (typeof value === "number") return value;
            const cleaned = String(value ?? "").replace(/[^0-9]/g, "");
            return cleaned ? Number(cleaned) : 0;
          };

          const isFinished = (data: any) =>
            data.status === "Completed" ||
            data.paymentStatus === "released" ||
            data.workStatus === "approved" ||
            data.workStatus === "completed";

          const isOngoing = (data: any) =>
            !isFinished(data) &&
            (data.paymentStatus === "funded" ||
              Number(data.escrowFundedTotalSats ?? 0) > 0 ||
              data.workStatus === "in_progress" ||
              data.workStatus === "submitted" ||
              data.workStatus === "changes_requested");

          const workHistoryFromContracts = contractsSnap.docs
            .map((d) => {
              const data = d.data() as any;
              const amountSats =
                typeof data.paymentTotalAmountSats === "number"
                  ? data.paymentTotalAmountSats
                  : parseSatsValue(data.budget);
              const amountLabel = amountSats > 0 ? `${amountSats.toLocaleString()} sats` : data.budget ?? "—";
              const startStr = formatContractDate(data.startDate);
              const endStr = formatContractDate(data.dueDate ?? data.updatedAt);
              const period = startStr && endStr ? `${startStr} – ${endStr}` : startStr || endStr || "";
              const statusLabel = isFinished(data) ? "COMPLETED" : isOngoing(data) ? "ONGOING" : "ACTIVE";
              return {
                title: data.title ?? "Contract",
                amount: amountLabel,
                status: statusLabel,
                rating: typeof data.rating === "number" ? data.rating : 5,
                review: data.clientReview ?? data.review ?? "",
                period,
              };
            })
            .sort((a) => (a.status === "COMPLETED" ? -1 : 1));

          setProfile((prev) => ({ ...prev, workHistory: workHistoryFromContracts }));
        } catch (err) {
          console.error("Failed to load work history from contracts:", err);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // ── derived ────────────────────────────────────────────────────────────────
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Your Name";
  const initials = [profile.firstName[0], profile.lastName[0]].filter(Boolean).join("").toUpperCase() || "?";

  // ── ledger chart helpers ───────────────────────────────────────────────────
  const maxBar  = profile.performanceData.length ? Math.max(...profile.performanceData) : 1;
  const peakIdx = profile.performanceData.indexOf(maxBar);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCF9F8] flex">
        <FreelancerSidebar active="/freelancer/dashboard/profile" />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-[#F7931A] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF9F8]">
      <div className="flex">

        {/* Sidebar */}
        <FreelancerSidebar active="/freelancer/dashboard/profile" />

        {/* Hidden avatar file input */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />

        {/* ── Page content ──────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 pt-14 md:pt-0">
          <div className="px-3 sm:px-5 lg:px-8 py-6 sm:py-8">

            {/* CONTAINER */}
            <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">

              {/* HERO SECTION */}
              <div className="flex flex-col lg:flex-row gap-5">

                {/* DIV-LEFT */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">

                  {/* Avatar + name block */}
                  <div className="flex flex-col sm:flex-row items-start gap-4">

                    {/* Avatar */}
                    <div
                      onClick={() => !avatarUploading && avatarInputRef.current?.click()}
                      className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] flex-shrink-0 rounded-[12px] overflow-hidden bg-[#E8E2D9] border border-[#DDD8D0] cursor-pointer relative group"
                    >
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[26px] font-black text-[#8C4F00]">
                          {initials}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wide">
                        {avatarUploading ? "Uploading…" : "Change"}
                      </div>
                    </div>

                    {/* Name / title / meta */}
                    <div className="flex-1 min-w-0 w-full">

                      {/* Name row — Conditional Rendering for Editing States */}
                      <div className="flex items-start gap-2 flex-wrap w-full">
                        {isEditing ? (
                          <div className="flex gap-2 w-full max-w-xl mt-1">
                            <input
                              type="text"
                              value={editForm.firstName}
                              onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                              className="px-3 py-1.5 text-[16px] sm:text-[20px] font-black w-1/2 border border-[#DDD8D0] rounded-[8px] bg-white text-[#0f0f0f] focus:outline-none focus:border-[#F7931A]"
                              placeholder="First Name"
                            />
                            <input
                              type="text"
                              value={editForm.lastName}
                              onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                              className="px-3 py-1.5 text-[16px] sm:text-[20px] font-black w-1/2 border border-[#DDD8D0] rounded-[8px] bg-white text-[#0f0f0f] focus:outline-none focus:border-[#F7931A]"
                              placeholder="Last Name"
                            />
                          </div>
                        ) : (
                          <>
                            <h1 className="text-[26px] break-words md:w-[290px] sm:text-[34px] lg:text-[40px] font-black text-[#0f0f0f] ">
                              {fullName}
                            </h1>
                            {profile.verified && (
                              <BadgeCheck size={20} className="flex-shrink-0 mt-1.5 text-[#3B82F6]" />
                            )}
                          </>
                        )}
                      </div>

                      {/* Title Form Field */}
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          className="mt-2 px-3 py-1.5 text-[14px] w-full max-w-xl border border-[#DDD8D0] rounded-[8px] bg-white font-medium text-[#1a1a1a] focus:outline-none focus:border-[#F7931A]"
                          placeholder="Professional Title"
                        />
                      ) : (
                        <p className="mt-1 text-[14px] sm:text-[16px] text-[#555] font-medium leading-snug">
                          {profile.title || "No title set"}
                        </p>
                      )}

                      {/* Location + member since */}
                      <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-[#888] font-medium uppercase tracking-[0.08em]">
                        {isEditing ? (
                          <div className="flex items-center gap-1 w-full max-w-xs">
                            <MapPin size={10} />
                            <input
                              type="text"
                              value={editForm.location}
                              onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                              className="px-2 py-1 text-[11px] w-full border border-[#DDD8D0] rounded bg-white focus:outline-none focus:border-[#F7931A]"
                              placeholder="Location"
                            />
                          </div>
                        ) : (
                          profile.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={10} />
                              {profile.location}
                            </span>
                          )
                        )}
                        {profile.memberSince && (
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            Member since {profile.memberSince}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats bar */}
                  <div className="bg-[#EDEAE5] rounded-[12px] px-4 md:mt-[40px] sm:px-6 py-4 sm:py-5 flex flex-wrap gap-x-6 sm:gap-x-10 gap-y-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Total Earned</p>
                      <p className="text-[16px] sm:text-[18px] font-black text-[#8C4F00] leading-none">
                        {profile.totalEarned || 0}
                        <span className="text-[11px] font-bold ml-1">Sats</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Job Success</p>
                      <p className="text-[16px] sm:text-[18px] font-black text-[#1a1a1a] leading-none">
                        {profile.jobSuccess}<span className="text-[11px] font-bold ml-0.5">%</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Jobs Completed</p>
                      <p className="text-[16px] sm:text-[18px] font-black text-[#1a1a1a] leading-none">
                        {profile.jobsCompleted}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Hours Worked</p>
                      <p className="text-[16px] sm:text-[18px] font-black text-[#1a1a1a] leading-none">
                        {profile.hoursWorked.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DIV-RIGHT — Action Cards Section */}
                <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0">
                  <div className="bg-white rounded-[16px] p-5 sm:p-6 flex flex-col gap-4 border border-[#EDEAE5]">

                    {/* Hourly Rate */}
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Hourly Rate</p>
                      <div className="flex items-baseline gap-1">
                        {isEditing ? (
                          <div className="flex items-center gap-1 w-full">
                            <input
                              type="text"
                              value={editForm.hourlyRate}
                              onChange={(e) => setEditForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                              className="px-2 py-1 text-[18px] w-32 font-black border border-[#DDD8D0] rounded bg-white focus:outline-none focus:border-[#F7931A]"
                              placeholder="3000"
                            />
                            <span className="text-[12px] font-bold text-[#999]">sats/hr</span>
                          </div>
                        ) : (
                          <>
                            <span className="text-[28px] sm:text-[32px] font-black text-[#1a1a1a] tracking-tight leading-none">
                              {profile.hourlyRate || "—"}
                            </span>
                            <span className="text-[12px] font-bold text-[#999]">sats/hr</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Toggle */}
                    {!isEditing ? (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="w-full py-3 rounded-[10px] bg-[#F7931A] hover:bg-[#E07D0A] text-[13px] sm:text-[14px] font-black text-white tracking-wide transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit3 size={16} />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={handleSaveProfileData}
                          className="w-full py-2.5 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-[13px] font-black text-white tracking-wide transition-colors"
                        >
                          Save Changes
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditing(false);
                            setEditForm({
                              firstName: profile.firstName,
                              lastName: profile.lastName,
                              title: profile.title,
                              location: profile.location,
                              hourlyRate: profile.hourlyRate,
                              bio: profile.bio,
                              skills: profile.skills.join(", "),
                              availability: profile.availability,
                              responseTime: profile.responseTime,
                            });
                          }}
                          className="w-full py-2.5 rounded-[10px] bg-[#EDEAE5] hover:bg-[#E0DDD8] text-[13px] font-black text-[#1a1a1a] tracking-wide transition-colors border border-[#DDD8D0]"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <div className="border-t border-[#F0EDE8]" />

                    {/* Response Time & Availability */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#999]">Response Time</span>
                        {isEditing ? (
                          <select
                            value={editForm.responseTime}
                            onChange={(e) => setEditForm(prev => ({ ...prev, responseTime: e.target.value }))}
                            className="w-full px-2 py-1.5 text-[12px] font-bold border border-[#DDD8D0] rounded bg-white text-[#1a1a1a] focus:outline-none focus:border-[#F7931A]"
                          >
                            <option value="Within an hour">Within an hour</option>
                            <option value="Within a few hours">Within a few hours</option>
                            <option value="Within a day">Within a day</option>
                            <option value="Asynchronous">Asynchronous</option>
                          </select>
                        ) : (
                          <span className="text-[13px] font-bold text-[#1a1a1a]">{profile.responseTime}</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#999]">Availability</span>
                        {isEditing ? (
                          <select
                            value={editForm.availability}
                            onChange={(e) => setEditForm(prev => ({ ...prev, availability: e.target.value }))}
                            className="w-full px-2 py-1.5 text-[12px] font-bold border border-[#DDD8D0] rounded bg-white text-[#1a1a1a] focus:outline-none focus:border-[#F7931A]"
                          >
                            <option value="Available">Available</option>
                            <option value="Full Time">Full Time</option>
                            <option value="Part Time">Part Time</option>
                            <option value="Busy / Booked">Busy / Booked</option>
                          </select>
                        ) : (
                          <span className="text-[13px] font-bold text-[#1a1a1a]">{profile.availability}</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* BIO / EXPERTISE / CHART SECTION */}
              <div className="flex flex-col lg:flex-row gap-5">
                <div className="w-full lg:flex-1 min-w-0 flex flex-col sm:flex-row gap-6 sm:gap-8">
                  
                  {/* Bio */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F7931A] mb-3">
                      Professional Bio
                    </p>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        rows={5}
                        className="w-full p-3 text-[13px] border border-[#DDD8D0] rounded-[8px] bg-white text-[#444] leading-[1.8] focus:outline-none focus:border-[#F7931A]"
                        placeholder="Write your professional overview bio..."
                      />
                    ) : (
                      <div className="text-[13px] sm:text-[14px] text-[#444] leading-[1.8] whitespace-pre-line">
                        {profile.bio || "No professional overview bio configured yet."}
                      </div>
                    )}
                  </div>

                  {/* Core Expertise */}
                  <div className="w-full sm:w-[220px] flex-shrink-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F7931A] mb-3">
                      Core Expertise
                    </p>
                    {isEditing ? (
                      <div className="flex flex-col gap-1.5">
                        <input
                          type="text"
                          value={editForm.skills}
                          onChange={(e) => setEditForm(prev => ({ ...prev, skills: e.target.value }))}
                          className="px-2 py-1.5 text-[12px] w-full border border-[#DDD8D0] rounded bg-white text-[#2a2a2a] focus:outline-none focus:border-[#F7931A]"
                          placeholder="Next.js, Bitcoin, LND (comma separated)"
                        />
                        <span className="text-[9px] text-[#999]">Separate with commas</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.length > 0 ? profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-2 rounded-[4px] bg-[#E8E5E0] text-[10px] font-black uppercase tracking-[0.1em] text-[#2a2a2a]"
                          >
                            {skill}
                          </span>
                        )) : (
                          <span className="text-[12px] text-[#999] italic">No expertise skills added</span>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* Ledger Performance chart */}
                <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0">
                  <div className="bg-[#1a1a1a] rounded-[14px] p-4 sm:p-5 h-full min-h-[160px] flex flex-col justify-between">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#666] mb-3">
                      Ledger Performance
                    </p>
                    <div className="flex items-end gap-[5px] sm:gap-[6px] h-[60px] sm:h-[70px] relative">
                      {profile.performanceData.map((val, i) => {
                        const isPeak   = i === peakIdx;
                        const heightPct = Math.round((val / maxBar) * 100);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center justify-end relative">
                            {isPeak && (
                              <span className="absolute -top-5 text-[7px] font-black uppercase tracking-widest bg-[#F7931A] text-black px-1.5 py-0.5 rounded-[3px] whitespace-nowrap">
                                PEAK
                              </span>
                            )}
                            <div
                              className={`w-full rounded-t-[3px] transition-all ${
                                isPeak ? "bg-[#F7931A]" : "bg-[rgba(247,147,26,0.25)]"
                              }`}
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-[8px] sm:text-[9px] text-[#555] leading-[1.5]">
                      Top 1% Engineering Performance Index. High reliability in mission-critical deployments.
                    </p>
                  </div>
                </div>

              </div>

              {/* WORK HISTORY SECTION */}
              <div className="lg:w-[70%]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F7931A]">
                      Work History
                    </p>
                    <p className="text-[11px] sm:text-[12px] text-[#999]">
                      Showing latest {profile.workHistory.length} of {profile.jobsCompleted}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {profile.workHistory.length > 0 ? profile.workHistory.map((job, i) => (
                      <div key={i} className="bg-white rounded-[12px] border border-[#EDEAE5] px-4 sm:px-6 py-4 sm:py-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <h3 className="text-[14px] sm:text-[15px] font-bold text-[#1a1a1a]">{job.title}</h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[12px] sm:text-[13px] font-semibold text-[#1a1a1a]">{job.amount}</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[#3B82F6] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
                              {job.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1,2,3,4,5].map((s) => (
                            <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= job.rating ? "#F7931A" : "#DDD"}>
                              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                            </svg>
                          ))}
                          <span className="ml-1 text-[12px] font-bold text-[#F7931A]">{job.rating.toFixed(1)}</span>
                        </div>
                        {job.review && (
                          <p className="text-[12px] sm:text-[13px] italic text-[#555] leading-[1.6] mb-2">"{job.review}"</p>
                        )}
                        {job.period && <p className="text-[11px] text-[#AAA]">{job.period}</p>}
                      </div>
                    )) : (
                      <p className="text-[13px] text-[#999] italic">No work history yet — completed jobs will appear here.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* PORTFOLIO SECTION */}
              <div className="lg:w-[70%] pb-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F7931A]">
                    Portfolio
                  </p>
                  <button 
                    onClick={openPortfolioModalForAdd}
                    className="px-3 py-1.5 rounded-[6px] bg-[#F7931A] hover:bg-[#E07D0A] text-[11px] font-black text-white uppercase tracking-wider transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Add Item
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.portfolioItems.length > 0 ? profile.portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-[16/10] rounded-[10px] overflow-hidden bg-[#1a1a1a] relative group border border-[#EDEAE5]"
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#2d1a00] flex items-center justify-center">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(247,147,26,0.4)" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          type="button"
                          onClick={() => openPortfolioModalForEdit(item)}
                          className="rounded-full bg-white/90 px-2 py-1 text-[11px] font-black text-[#1a1a1a] hover:bg-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePortfolio(item.id, item.title)}
                          className="rounded-full bg-red-500 px-2 py-1 text-[11px] font-black text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-1">
                        {item.title && (
                          <p className="text-white text-[14px] font-black flex items-center gap-1.5">
                            {item.title}
                            {item.projectLink && <ExternalLink size={12} className="text-[#F7931A]" />}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-[#CCC] text-[11px] line-clamp-2 font-medium leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {item.projectLink ? (
                        <a
                          href={item.projectLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 z-0"
                          aria-label={`Open ${item.title || 'project'} link`}
                        />
                      ) : null}
                    </div>
                  )) : (
                    <p className="text-[13px] text-[#999] italic col-span-2">No portfolio items yet. Add showcase projects above.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* ── TOAST NOTIFICATION ─────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-[12px] shadow-lg border transition-all duration-300 ${
          toast.show
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-3 pointer-events-none'
        } ${
          toast.type === 'success'
            ? 'bg-white border-emerald-200 text-[#1a1a1a]'
            : 'bg-white border-red-200 text-[#1a1a1a]'
        }`}
      >
        {toast.type === 'success' ? (
          <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
        ) : (
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
        )}
        <span className="text-[13px] font-semibold pr-1">{toast.message}</span>
        <button
          onClick={() => setToast(prev => ({ ...prev, show: false }))}
          className="ml-1 text-[#AAA] hover:text-[#555] transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ──────────────────────────────────────────── */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[16px] overflow-hidden shadow-xl border border-[#EDEAE5]">
            
            {/* Header */}
            <div className="px-5 pt-5 pb-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Trash2 size={16} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-black text-[#1a1a1a] mb-1">Delete Portfolio Item</h3>
                <p className="text-[13px] text-[#666] leading-[1.5]">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-[#1a1a1a]">"{deleteConfirmation.title}"</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex items-center gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleteConfirmation.isDeleting}
                className="flex-1 py-2.5 rounded-[10px] border border-[#DDD8D0] bg-white text-[13px] font-bold text-[#555] hover:bg-[#FCF9F8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePortfolio}
                disabled={deleteConfirmation.isDeleting}
                className="flex-1 py-2.5 rounded-[10px] bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-[13px] font-black text-white transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {deleteConfirmation.isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL COMPONENT — ADD / EDIT PORTFOLIO ITEM ───────────────────────── */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-[90vh] flex flex-col rounded-[16px] overflow-hidden shadow-xl border border-[#EDEAE5] animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-5 py-4 bg-[#FCF9F8] border-b border-[#EDEAE5] flex items-center justify-between flex-shrink-0">
              <h3 className="text-[14px] font-black uppercase tracking-wider text-[#1a1a1a]">
                {portfolioModalMode === 'edit' ? 'Edit Portfolio Case' : 'Add Portfolio Case'}
              </h3>
              <button 
                type="button"
                onClick={() => {
                  if (!portfolioUploading) {
                    closePortfolioModal();
                  }
                }}
                className="text-[#999] hover:text-[#1a1a1a] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPortfolioSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Project Mockup Image</label>
                <input 
                  type="file" 
                  ref={portfolioItemFileRef}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handlePortfolioFileSelect}
                />
                {newPortfolio.previewUrl ? (
                  <div className="relative aspect-[16/9] w-full rounded-[8px] overflow-hidden border border-[#DDD8D0]">
                    <img src={newPortfolio.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setNewPortfolio(prev => ({ ...prev, file: null, previewUrl: "" }))}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => portfolioItemFileRef.current?.click()}
                    className="w-full aspect-[16/9] border-2 border-dashed border-[#DDD8D0] hover:border-[#F7931A] rounded-[8px] flex flex-col items-center justify-center gap-2 bg-[#FCF9F8] text-[#888] hover:text-[#F7931A] transition-colors text-[12px] font-medium"
                  >
                    <Plus size={20} />
                    Upload Project Graphic
                  </button>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Project Title</label>
                <input 
                  type="text"
                  value={newPortfolio.title}
                  onChange={(e) => setNewPortfolio(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="e.g., Lightning Vault Protocol"
                  className="w-full px-3 py-2 text-[13px] border border-[#DDD8D0] rounded-[6px] focus:outline-none focus:border-[#F7931A]"
                />
              </div>

              {/* Destination Link */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-[0.12em] text-[#999] mb-1">Project Web URL Link</label>
                <input 
                  type="text"
                  value={newPortfolio.projectLink}
                  onChange={(e) => setNewPortfolio(prev => ({ ...prev, projectLink: e.target.value }))}
                  required
                  placeholder="e.g., github.com/user/project or website.com"
                  className="w-full px-3 py-2 text-[13px] border border-[#DDD8D0] rounded-[6px] focus:outline-none focus:border-[#F7931A]"
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.12em] text-[#999]">Short Description</label>
                  <span className={`text-[10px] font-bold ${newPortfolio.description.length >= 150 ? 'text-red-500' : 'text-[#888]'}`}>
                    {newPortfolio.description.length}/150
                  </span>
                </div>
                <textarea 
                  value={newPortfolio.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 150) {
                      setNewPortfolio(prev => ({ ...prev, description: value }));
                    }
                  }}
                  required
                  rows={3}
                  placeholder="Max 150 characters overview description of what you engineered..."
                  className="w-full px-3 py-2 text-[13px] border border-[#DDD8D0] rounded-[6px] focus:outline-none focus:border-[#F7931A] resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 mt-auto pt-2 flex-shrink-0">
                <button
                  type="submit"
                  disabled={portfolioUploading}
                  className="flex-1 py-2.5 rounded-[8px] bg-[#F7931A] hover:bg-[#E07D0A] disabled:bg-amber-400 text-[13px] font-black text-white uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                >
                  {portfolioUploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    portfolioModalMode === 'edit' ? 'Update Project' : 'Save Project'
                  )}
                </button>
                <button
                  type="button"
                  disabled={portfolioUploading}
                  onClick={() => {
                    if (!portfolioUploading) {
                      closePortfolioModal();
                    }
                  }}
                  className="px-4 py-2.5 rounded-[8px] border border-[#DDD8D0] bg-white text-[13px] font-bold text-[#555] hover:bg-[#FCF9F8] transition-colors"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}