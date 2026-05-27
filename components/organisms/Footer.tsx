// 'use client';

// import Image from 'next/image';

// export default function Footer() {
//   return (
//     <footer className="bg-[#FAF8F5] py-4 sm:py-5">
//       <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//           <div className="flex items-center gap-2">
//             <div className="relative h-7 w-7 sm:h-8 sm:w-8">
//               <Image src="/assets/logo.png" alt="Bitlance logo" fill className="object-contain" />
//             </div>
//             <span className="text-base sm:text-lg font-bold text-[#1B1C1B]">Bitlance</span>
//           </div>

//           <nav className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-[#5B5B5B]">
//             <a href="#" className="hover:text-[#8C4F00]">How it Works</a>
//             <a href="#" className="hover:text-[#8C4F00]">Find Talent</a>
//             <a href="#" className="hover:text-[#8C4F00]">Find Work</a>
//             <a href="#" className="hover:text-[#8C4F00]">Terms</a>
//             <a href="#" className="hover:text-[#8C4F00]">Privacy</a>
//             <a href="#" className="hover:text-[#8C4F00]">Contact</a>
//           </nav>
//         </div>
//       </div>
//     </footer>
//   );
// }




'use client';

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#F6F3F1] py-6 sm:py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Top div: Logo + Bitlance */}
        <div className="flex items-center gap-2 mb-6">
          <div className="relative h-7 w-7 sm:h-8 sm:w-8">
            <Image src="/assets/logo.png" alt="Bitlance logo" fill className="object-contain" />
          </div>
          <span className="text-base sm:text-lg font-bold text-[#1B1C1B]">Bitlance</span>
        </div>

        {/* Bottom div: Copyright left, Links right */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs sm:text-sm text-[#5B5B5B]">
            ©2026 Bitlance. Built on Bitcoin
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#5B5B5B]">
            <a href="#" className="hover:text-[#554335]">How it Works</a>
            <a href="#" className="hover:text-[#554335]">Find Talent</a>
            <a href="#" className="hover:text-[#554335]">Find Work</a>
            <a href="#" className="hover:text-[#554335]">Terms</a>
            <a href="#" className="hover:text-[#554335]">Privacy</a>
            <a href="#" className="hover:text-[#554335]">Contact</a>
          </div>
        </div>

      </div>
    </footer>
  );
}