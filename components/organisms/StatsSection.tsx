'use client';

import Image from 'next/image';

const SPONSORS = [
  { alt: 'Sponsor 1', src: '/assets/image1.png' },
  { alt: 'Sponsor 2', src: '/assets/image2.png' },
  { alt: 'Sponsor 3', src: '/assets/image3.png' },
  { alt: 'Sponsor 4', src: '/assets/image4.png' },
];

const STATS = [
  { value: '200+', label: 'ACTIVE JOBS' },
  { value: '1.25M', label: 'SATS PAID' },
  { value: '98%', label: 'SUCCESS RATE' },
];

export default function StatsSection() {
  return (
    <section className="bg-[#F6F3F1] py-8 sm:py-10 lg:pb-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* <div className="flex justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-4 w-full sm:max-w-3xl lg:max-w-4xl">
            {SPONSORS.map((item) => (
              <div key={item.alt} className="flex items-center justify-center p-2 sm:p-3  ">
                <Image src={item.src} alt={item.alt} width={60} height={60} className="object-contain" />
              </div>
            ))}
          </div>
        </div> */}

        <div className="mt-6 sm:mt-8 flex justify-center">
          <div className="grid gap-2 sm:gap-3 md:gap-4 lg:gap-5 grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 w-full max-w-4xl">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-xl sm:rounded-xl md:rounded-2xl bg-white p-3 sm:p-4 md:p-5 text-center shadow-sm">
                <div className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#8C4F00]">{stat.value}</div>
                <div className="mt-1 text-xs sm:text-xs md:text-sm font-semibold tracking-widest text-[#666]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
