'use client'

import { useEffect, useState } from "react";

const satsValues = ["+120,000 Sats", "+45,500 Sats", "+300,000 Sats", "+88,200 Sats"];

export default function Hero() {
  const [payIndex, setPayIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPayIndex((i) => (i + 1) % satsValues.length);
        setVisible(true);
      }, 350);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>

      <section className="font-inter bg-[#FCF9F7] min-h-screen sm:min-h-[600px] pt-[120px] sm:pt-[110px] lg:pt-[150px] pb-10 sm:pb-12 lg:pb-0 px-4 sm:px-6 lg:px-20">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-8 lg:gap-12 items-center">

          {/* LEFT */}
          <div className="w-full lg:w-[655px]">
            <h1 className="font-inter text-3xl sm:text-4xl md:text-5xl lg:text-[68px] font-extrabold leading-tight sm:leading-[1.1] text-[#1a1a1a] tracking-tight">
              Work Online.<br />
              Get Paid in <span className="text-[#F7931A]">Bitcoin.</span>
            </h1>

            <p className="mt-5 text-base sm:text-[17px] leading-relaxed sm:leading-[1.7] text-[#666] max-w-full lg:max-w-[480px]">
              The simplest freelancing platform built for the Bitcoin
              economy. Find jobs, hire talent, and earn sats globally —
              without borders.
            </p>

            <div className="mt-6 flex flex-row flex-wrap items-center justify-start gap-2 sm:gap-3">
              <button className="font-inter inline-flex items-center justify-center gap-2 bg-[#F7931A] text-[#1a1a1a] text-xs sm:text-sm font-bold rounded-full px-3 sm:px-5 py-3 sm:py-3 border-none cursor-pointer transition-all duration-200 hover:-translate-y-px shadow-sm min-w-[130px]">
                Find Work &nbsp;→
              </button>

              <button className="font-inter inline-flex items-center justify-center bg-[#E5E2E0] text-[#1a1a1a] text-xs sm:text-sm font-bold rounded-full px-3 sm:px-5 py-3 sm:py-3 border border-[#ddd] hover:border-[#bbb] cursor-pointer transition-all duration-200 hover:-translate-y-px min-w-[130px]">
                Post a Job
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-full sm:w-[440px]">
            <div className="bg-[#ecdfc8] rounded-[32px] sm:rounded-[40px] w-full h-[280px] sm:h-[400px] relative flex items-end justify-center overflow-visible shadow-sm">

              {/* Hero Image */}
              <img
                src="/assets/heroimage.png"
                alt="Hero Image"
                className="absolute inset-0 w-full h-full object-cover rounded-[32px] sm:rounded-[40px]"
              />

              {/* Payment pill */}
              <div
                className={`
                  absolute bottom-6 sm:bottom-7 left-1/2 -translate-x-1/2
                  bg-white rounded-[16px] px-3 sm:px-5 py-2 sm:py-[12px] pl-3 sm:pl-4
                  flex items-center gap-2 sm:gap-[12px]
                  shadow-[0_8px_32px_rgba(0,0,0,0.08)]
                  whitespace-nowrap min-w-[220px] sm:min-w-[260px]
                  transition-all duration-300
                  ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
                `}
              >
                {/* Lightning icon */}
                <div className="w-8 h-8 sm:w-[36px] sm:h-[36px] bg-[#f5a623] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff" />
                  </svg>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <span className="block text-[9px] sm:text-[10px] font-bold text-[#aaa] tracking-[0.08em] uppercase mb-[2px]">
                    Payment Received
                  </span>
                  <div className="font-inter text-[14px] sm:text-[17px] font-bold text-[#1a1a1a] truncate">
                    {satsValues[payIndex]}
                  </div>
                </div>

                {/* Instant tag */}
                <span className="text-[10px] sm:text-[12px] font-bold text-[#999] tracking-[0.05em] ml-auto">
                  INSTANT
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>
    </>
  );
}