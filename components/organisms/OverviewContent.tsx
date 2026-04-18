
// import React from 'react';
// import { 
//   CircleDollarSign, 
//   Briefcase, 
//   Trophy, 
//   ArrowUpRight, 
//   Activity, 
//   CheckCircle2,
//   Rocket,
//   Plus
// } from 'lucide-react';

// export default function OverviewContent() {
//   return (
//     <div className="space-y-10">
//       {/* Welcome Header */}
//       <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-2">
//         <div className="space-y-1">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-orange-100 rounded-xl">
//               <Rocket className="w-6 h-6 text-orange-600" />
//             </div>
//             <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight">Welcome, Satoshi!</h1>
//           </div>
//           <p className="text-[#6b6560] text-sm md:text-base font-medium">Ready to stack some more sats today?</p>
//         </div>
//         <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] transition-all active:scale-95 group">
//           <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
//           Find New Gigs
//         </button>
//       </header>

//       {/* Quick Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <StatCard 
//           title="Total Earnings" 
//           value="2.45 BTC" 
//           subtext="+12.5% this month" 
//           icon={<CircleDollarSign className="w-6 h-6" />}
//           trend="up"
//           variant="orange"
//         />
//         <StatCard 
//           title="Ongoing Gigs" 
//           value="8" 
//           subtext="2 active today" 
//           icon={<Briefcase className="w-6 h-6" />}
//           trend="neutral"
//           variant="white"
//         />
//         <StatCard 
//           title="Reputation" 
//           value="98.2%" 
//           subtext="Top Rated Plus" 
//           icon={<Trophy className="w-6 h-6" />}
//           trend="up"
//           variant="white"
//         />
//       </div>

//       <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
//         {/* Recent Activity Section */}
//         <div className="bg-white rounded-[40px] border border-orange-100 p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] relative overflow-hidden group">
//           <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-orange-100/50 transition-colors duration-500"></div>
          
//           <div className="relative">
//             <div className="flex items-center justify-between mb-10">
//               <div className="flex items-center gap-3">
//                 <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
//                 <h2 className="text-xl font-bold text-[#1a1a1a]">Recent Activity</h2>
//               </div>
//               <button className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1 group">
//                 View Log 
//                 <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
//               </button>
//             </div>
            
//             <div className="py-20 flex flex-col items-center text-center">
//               <div className="w-24 h-24 rounded-[32px] bg-orange-50 flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform duration-500">
//                 <Activity className="w-10 h-10 text-orange-300" />
//               </div>
//               <h3 className="text-xl font-extrabold text-[#1a1a1a] mb-3">Quiet Day?</h3>
//               <p className="text-base text-[#6b6560] max-w-[300px] leading-relaxed">
//                 Connect your Bitcoin wallet and start applying to see your latest milestone updates here.
//               </p>
//               <button className="mt-8 px-10 py-3.5 bg-white border-2 border-orange-100 hover:border-orange-500 text-[#1a1a1a] font-bold rounded-2xl transition-all hover:shadow-lg active:scale-95">
//                 Explore The Feed
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Sidebar Widgets Area */}
//         <div className="space-y-6">
//           {/* Profile Completeness Widget - High Impact Design */}
//           <div className="bg-[#1a1a1a] text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
//             <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all duration-700"></div>
            
//             <div className="relative">
//               <div className="flex items-center gap-2 mb-6">
//                 <div className="p-1.5 bg-white/10 rounded-lg">
//                   <CheckCircle2 className="w-4 h-4 text-orange-400" />
//                 </div>
//                 <h3 className="text-base font-bold tracking-tight">Profile Mastered</h3>
//               </div>

//               <div className="flex items-end justify-between mb-4">
//                 <span className="text-4xl font-extrabold text-orange-500">85<span className="text-xl">%</span></span>
//                 <span className="text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-md uppercase tracking-widest">Level 2</span>
//               </div>

//               <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-6 border border-white/5">
//                 <div 
//                   className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)] relative"
//                   style={{ width: '85%' }}
//                 >
//                   <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
//                 </div>
//               </div>

//               <p className="text-sm text-gray-400 leading-relaxed mb-10">
//                 Boost your visibility in the Bitcoin job market by <span className="text-white font-bold">2.4x</span> with a completed profile.
//               </p>

//               <button className="w-full py-4 px-6 bg-white text-[#1a1a1a] rounded-2xl font-bold text-sm hover:bg-orange-50 transition-all active:scale-[0.98] shadow-lg">
//                 Complete Now
//               </button>
//             </div>
//           </div>

//           {/* Quick Tip / Notification Widget */}
//           <div className="bg-orange-50 rounded-[40px] p-8 border border-orange-100 border-dashed">
//             <h4 className="text-orange-800 font-bold mb-3 flex items-center gap-2">
//               <CircleDollarSign className="w-4 h-4" />
//               Pro Tip
//             </h4>
//             <p className="text-orange-900/70 text-sm leading-relaxed">
//               Verify your GitHub to unlock premium developer-only roles.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Sub-components
// function StatCard({ title, value, subtext, icon, trend, variant }: any) {
//   const isOrange = variant === 'orange';
  
//   return (
//     <div className={`
//       relative rounded-[32px] p-7 transition-all duration-300 group cursor-default border
//       ${isOrange 
//         ? 'bg-[#1a1a1a] border-gray-800 shadow-2xl' 
//         : 'bg-white border-orange-50 hover:border-orange-200 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.02)] hover:shadow-xl'}
//     `}>
//       <div className="flex flex-col gap-6">
//         <div className={`
//           w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
//           ${isOrange 
//             ? 'bg-orange-500 text-white rotate-6 group-hover:rotate-0' 
//             : 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white'}
//         `}>
//           {icon}
//         </div>
        
//         <div>
//           <p className={`text-[11px] font-bold uppercase tracking-[0.1em] mb-2 ${isOrange ? 'text-gray-400' : 'text-[#9ca3af]'}`}>
//             {title}
//           </p>
//           <div className="flex flex-col">
//             <h3 className={`text-2xl font-black ${isOrange ? 'text-white' : 'text-[#1a1a1a]'}`}>
//               {value}
//             </h3>
//             <div className="mt-2 text-[11px] font-bold flex items-center gap-1.5">
//               <span className={`px-2 py-0.5 rounded-md ${
//                 trend === 'up' 
//                   ? (isOrange ? 'text-orange-400 bg-orange-400/10' : 'text-green-600 bg-green-50')
//                   : 'text-gray-500 bg-gray-100'
//               }`}>
//                 {subtext}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { 
  CircleDollarSign, 
  Briefcase, 
  Trophy, 
  ArrowUpRight, 
  CheckCircle2,
  Rocket,
  Plus,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';

export default function OverviewContent() {
  const [displayName, setDisplayName] = useState('Freelancer');
  const [recentApplications, setRecentApplications] = useState<
    Array<{ id: string; project: string; client: string; amount: string; status: string; date: string }>
  >([]);

  useEffect(() => {
    const unsubscribeAuth = firebaseAuth.onAuthStateChanged((user) => {
      if (!user) return;
      const loadProfile = async () => {
        try {
          const snap = await getDoc(doc(firebaseDb, 'all_users', user.uid));
          const data = snap.exists() ? (snap.data() as any) : null;
          setDisplayName(data?.fullName ?? user.displayName ?? 'Freelancer');
        } catch {
          setDisplayName(user.displayName ?? 'Freelancer');
        }
      };
      loadProfile();
      const proposalsQuery = query(
        collection(firebaseDb, 'proposals'),
        where('freelancerId', '==', user.uid)
      );
      const unsubscribe = onSnapshot(proposalsQuery, (snapshot) => {
        const items = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          const createdAt = data.createdAt?.seconds ? data.createdAt.seconds * 1000 : 0;
          const date = createdAt ? `${Math.max(1, Math.round((Date.now() - createdAt) / 3600000))}h ago` : 'Recently';
          const statusMap: any = {
            accepted: 'Approved',
            submitted: 'Pending',
            rejected: 'Rejected',
          };
          return {
            id: docSnap.id,
            project: data.jobTitle ?? 'Job Proposal',
            client: data.clientName ?? 'Client',
            amount: data.rate ?? '—',
            status: statusMap[data.status] ?? 'Pending',
            date,
          };
        });
        setRecentApplications(items.slice(0, 5));
      });
      return () => unsubscribe();
    });
    return () => unsubscribeAuth();
  }, []);

  const proposalsCount = recentApplications.length;
  const pendingCount = useMemo(
    () => recentApplications.filter((app) => app.status === 'Pending').length,
    [recentApplications]
  );
  const approvedCount = useMemo(
    () => recentApplications.filter((app) => app.status === 'Approved').length,
    [recentApplications]
  );

  return (
    <section className="bg-[#FCF9F7] py-16">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        
        {/* 1. HEADER SECTION */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F7931A]/10 rounded-xl">
                <Rocket className="w-6 h-6 text-[#F7931A]" />
              </div>
              <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight">
                Welcome, {displayName}!
              </h1>
            </div>
            <p className="text-[#6b6560] text-sm md:text-base font-medium">Ready to stack some more sats today?</p>
          </div>
          <button
            onClick={() => (window.location.href = "/freelancer/dashboard/job-feed")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-400 to-[#F7931A] text-white px-8 py-4 rounded-2xl font-bold text-sm hover:shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] transition-all active:scale-95 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            Find New Gigs
          </button>
        </header>

        {/* 2. STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard 
            title="Total Earnings" 
            value="0 sats" 
            sub="Tracking soon" 
            icon={<CircleDollarSign className="w-6 h-6" />}
            variant="orange"
          />
          <StatCard 
            title="Pending Proposals" 
            value={`${pendingCount}`} 
            sub="Awaiting response" 
            icon={<Briefcase className="w-6 h-6" />}
            variant="white"
          />
          <StatCard 
            title="Proposals Sent" 
            value={`${proposalsCount}`} 
            sub={`${approvedCount} approved`} 
            icon={<Trophy className="w-6 h-6" />}
            variant="white"
          />
        </div>

        {/* 3. RECENT APPLICATIONS TABLE - now full width */}
        <div className="bg-white rounded-3xl border border-[#ece7df] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#F7931A] rounded-full"></div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1a1a1a]">Recent Activity</h2>
            </div>
            <button className="text-sm font-bold text-[#8C4F00] hover:text-[#F7931A] transition-colors flex items-center gap-1 group">
              View Log 
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#FCF9F7] text-[11px] uppercase tracking-wider text-[#6b6560] font-bold">
                  <th className="px-6 py-4">Project / Client</th>
                  <th className="px-6 py-4">Bid Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece7df]">
                {recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-[#FCF9F7] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#1a1a1a] group-hover:text-[#F7931A] transition-colors">{app.project}</div>
                      <div className="text-xs text-[#6b6560]">{app.client}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-[#1a1a1a]">{app.amount}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-[#6b6560]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {app.date}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ title, value, sub, icon, variant }: any) {
  const isDark = variant === 'dark';
  return (
    <div className={`p-6 rounded-[28px] border transition-all hover:translate-y-[-2px] ${
      isDark ? 'bg-[#1a1a1a] border-gray-800 text-white' : 'bg-white border-gray-100 shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-500/20 text-orange-500' : 'bg-orange-50 text-orange-500'}`}>
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-orange-400' : 'bg-green-50 text-green-600'}`}>
          {sub}
        </span>
      </div>
      <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
      <h3 className="text-xl font-black tracking-tight">{value}</h3>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Approved: "bg-green-50 text-green-600 border-green-100",
    Pending: "bg-orange-50 text-orange-600 border-orange-100",
    Rejected: "bg-gray-50 text-gray-500 border-gray-100",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
}
