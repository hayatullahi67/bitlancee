'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const btcValues = [
  "+0.81250 BTC",
  "+0.04500 BTC",
  "+0.15820 BTC",
  "+0.00980 BTC",
  "+1.24000 BTC"
];

export default function Hero() {
  const router = useRouter();
  const [payIndex, setPayIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPayIndex((i) => (i + 1) % btcValues.length);
        setVisible(true);
      }, 350);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>

      <section className="font-inter bg-[#FCF9F7] pt-[130px] sm:pt-[140px] lg:pt-[160px] pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-20 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-12 lg:gap-16 items-center">

          {/* LEFT COLUMN */}
          <div className="w-full lg:max-w-[620px] flex flex-col items-start">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#FFF4E5] border border-orange-100/50 text-[#F97316] text-xs sm:text-[13px] font-bold px-4 py-1.5 rounded-full mb-6">
              <span className="text-sm">⚡</span> The Bitcoin Freelance Marketplace
            </div>

            {/* Heading */}
            <h1 className="font-inter text-4xl sm:text-5xl md:text-[54px] lg:text-[64px] font-black leading-[1.08] text-[#1A1A1A] tracking-[-0.02em]">
              Work Online.<br />
              Get Paid in <span className="text-[#F97316]">Bitcoin.</span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-base sm:text-[17px] leading-[1.7] text-gray-500 max-w-[490px]">
              The simplest freelance platform built for the Bitcoin economy.
              Find jobs, hire talent, and earn sats globally — without borders.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-row flex-wrap items-center justify-start gap-4 w-full">
              <button
                onClick={() => router.push('/login')}
                className="font-inter inline-flex items-center justify-center bg-[#F97316] text-white text-sm sm:text-base font-bold rounded-xl px-7 py-3.5 hover:bg-[#EA6C0A] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer min-w-[140px]"
              >
                Find Work
              </button>

              <button
                onClick={() => router.push('/login')}
                className="font-inter inline-flex items-center justify-center bg-white text-[#F97316] border border-[#F97316] text-sm sm:text-base font-bold rounded-xl px-7 py-3.5 hover:bg-orange-50/50 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-gray-200/50 cursor-pointer min-w-[140px]"
              >
                Post a Job
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex flex-row items-center gap-4 sm:gap-5">
              <div className="flex -space-x-3 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="User Avatar 1"
                  className="w-10 h-10 rounded-full border-2 border-[#FCF9F7] object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="User Avatar 2"
                  className="w-10 h-10 rounded-full border-2 border-[#FCF9F7] object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="User Avatar 3"
                  className="w-10 h-10 rounded-full border-2 border-[#FCF9F7] object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="User Avatar 4"
                  className="w-10 h-10 rounded-full border-2 border-[#FCF9F7] object-cover"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium leading-[1.5] max-w-[280px]">
                Trusted by <span className="font-bold text-gray-800">1,000+ Bitcoin companies</span> and talented freelancers worldwide.
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full max-w-[460px] lg:max-w-[480px] flex-shrink-0">
            <div className="bg-[#FAF2E8] rounded-[40px] w-full h-[320px] sm:h-[420px] relative flex items-end justify-center overflow-visible shadow-sm">

              {/* Hero Image */}
              <img
                src="/assets/heroimage.png"
                alt="Freelancer at computer"
                className="absolute inset-0 w-full h-full object-cover rounded-[40px]"
              />

              {/* Payment notification overlay */}
              <div
                className={`
                  absolute bottom-6 sm:bottom-8 left-[-16px] sm:left-[-32px]
                  bg-white rounded-2xl p-4 pl-4 pr-5
                  flex items-center gap-3.5
                  shadow-[0_12px_40px_rgba(0,0,0,0.08)]
                  border border-gray-100/80
                  whitespace-nowrap w-[90%] sm:w-[330px]
                  transition-all duration-300 select-none
                  ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
                `}
              >
                {/* Lightning circle icon */}
                <div className="w-11 h-11 bg-[#F97316] rounded-full flex items-center justify-center shrink-0 shadow-md shadow-orange-500/10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Text and labels */}
                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] font-bold text-gray-400 tracking-[0.06em] uppercase mb-[2px]">
                    Payment received
                  </span>
                  <div className="font-inter text-base sm:text-[18px] font-black text-gray-900 leading-tight">
                    {btcValues[payIndex]}
                  </div>
                  <span className="block text-[11px] text-gray-400 font-medium mt-[2px]">
                    21 minutes ago
                  </span>
                </div>

                {/* Status completed badge */}
                <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/20 shrink-0">
                  Completed
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>
    </>
  );
}