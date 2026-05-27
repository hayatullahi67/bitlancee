'use client';

import FeatureCard from '../atoms/FeatureCard';

const FEATURES = [
  {
    icon: '/assets/lightning.png',
    title: 'Lightning Payouts',
    description: 'No more waiting 7-14 days for withdrawals. Receive your earnings instantly through Lightning Network.',
  },
  {
    icon: '/assets/global.png',
    title: 'Global Access',
    description: 'Earn money from anywhere in the world. No bank account required — just a Bitcoin wallet.',
  },
  {
    icon: '/assets/low.png',
    title: 'Low Fees',
    description: 'We take significantly less than traditional platforms. More value stays in the hands of creators.',
  },
  {
    icon: '/assets/truth.png',
    title: 'Trustless Escrow',
    description: 'Smart contract-based escrow ensures that payment is guaranteed for delivered work.',
  },
  {
    icon: '/assets/easy.png',
    title: 'Easy Onboarding',
    description: 'No complex forms or KYC to get started browsing and bidding on minor tasks.',
  },
  {
    icon: '/assets/sats.png',
    title: 'Sats-Flow Analytics',
    description: 'Visualize your earnings and project status with our custom Bitcoin-centric dashboard.',
  },
];

export default function WhyBitlance() {
  return (
    <section className="bg-[#1B1C1B] py-16">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-white">Built for the Bitcoin Native</h2>
          <p className="mt-2 text-sm text-[#d4d5d3]">Why freelancers are switching to Bitlance.</p>
        </div>

        <div className="grid gap-6 max-sm:grid-cols-1 grid-cols-2 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
