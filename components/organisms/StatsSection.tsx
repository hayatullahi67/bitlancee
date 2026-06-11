// 'use client';

// const STATS = [
//   {
//     value: '200+',
//     label: 'Active Jobs',
//     icon: (
//       <svg className="w-10 h-10 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//       </svg>
//     )
//   },
//   {
//     value: '1.25M',
//     label: 'Sats Paid',
//     icon: (
//       <svg className="w-10 h-10 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c5.523 0 10-2.239 10-5s-4.477-5-10-5-10 2.239-10 5 4.477 5 10 5z" />
//         <path strokeLinecap="round" strokeLinejoin="round" d="M22 17v-4c0-2.761-4.477-5-10-5S2 10.239 2 13v4" />
//         <path strokeLinecap="round" strokeLinejoin="round" d="M22 12V8c0-2.761-4.477-5-10-5S2 5.239 2 8v4" />
//       </svg>
//     )
//   },
//   {
//     value: '98%',
//     label: 'Success Rate',
//     icon: (
//       <svg className="w-10 h-10 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a7 7 0 100-14 7 7 0 000 14z" />
//         <path strokeLinecap="round" strokeLinejoin="round" d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
//       </svg>
//     )
//   }
// ];

// export default function StatsSection() {
//   return (
//     <section className="bg-[#FCF9F7] pb-16 sm:pb-20 px-4 sm:px-6 lg:px-20">
//       <div className="mx-auto w-full max-w-7xl">
//         <div className="bg-[#FAF5EE]/70  p-5 sm:p-7 md:p-8 lg:p-10 border border-[#F5EFE6]">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
//             {STATS.map((stat) => (
//               <div
//                 key={stat.label}
//                 className="bg-white rounded-2xl p-5 sm:p-6 flex items-center gap-4 sm:gap-5 shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-white/80 transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:-translate-y-[1px]"
//               >
//                 {/* Icon wrapper */}
//                 <div className="shrink-0 flex items-center justify-center bg-orange-50/50 rounded-xl p-2.5">
//                   {stat.icon}
//                 </div>
                
//                 {/* Text contents */}
//                 <div>
//                   <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">
//                     {stat.value}
//                   </div>
//                   <div className="text-xs sm:text-[13px] font-bold tracking-wide text-gray-400 uppercase mt-1.5 sm:mt-2">
//                     {stat.label}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }


'use client';

const STATS = [
  {
    value: '200+',
    label: 'Active Jobs',
    icon: (
      <svg className="w-10 h-10 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    value: '1.25M',
    label: 'Sats Paid',
    icon: (
      <svg className="w-10 h-10 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c5.523 0 10-2.239 10-5s-4.477-5-10-5-10 2.239-10 5 4.477 5 10 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 17v-4c0-2.761-4.477-5-10-5S2 10.239 2 13v4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 12V8c0-2.761-4.477-5-10-5S2 5.239 2 8v4" />
      </svg>
    )
  },
  {
    value: '98%',
    label: 'Success Rate',
    icon: (
      <svg className="w-10 h-10 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a7 7 0 100-14 7 7 0 000 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
      </svg>
    )
  }
];

export default function StatsSection() {
  return (
    <section className="bg-[#FAF8F6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Outer subtle container wrapper */}
        <div className="bg-[#F6F1EB]/40 rounded-[32px] p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 sm:p-8 flex items-center gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-neutral-100"
              >
                {/* Clean standalone Icon */}
                <div className="shrink-0 flex items-center justify-center">
                  {stat.icon}
                </div>
                
                {/* Text contents matching typography weight & color */}
                <div className="flex flex-col justify-center">
                  <div className="text-2xl sm:text-[28px] font-bold text-black tracking-tight leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[13px] sm:text-sm font-medium text-[#64748B] mt-1">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
