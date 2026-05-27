'use client';

import JobCard from '../atoms/JobCard';
import FeaturedJob from '../molecules/FeaturedJob';

const FEATURED = {
  badge: 'FEATURED',
  icon: '🦀',
  title: 'Senior Rust Engineer for Lightning L3',
  description: 'We are looking for a backend specialist to build low-latency infrastructure for a new Bitcoin-native scaling solution. Remote-first team.',
  price: '4.5M Sats',
  tags: ['Rust', 'Lightning', 'Remote'],
  profileName: 'Marcus R.',
  profileTitle: 'UI/UX Designer',
  rate: '120k Sats/hr',
  completed: 42,
  rating: 5,
};

const OPPORTUNITIES = [
  {
    icon: '/assets/wallet.png',
    title: 'Bitcoin Wallet Icon Pack',
    description: 'Custom iconography for a new non-custodial wallet application.',
    price: '500k Sats',
    tags: ['Iconography', 'SVG'],
  },
  {
    icon: '/assets/smart.png',
    title: 'Smart Contract Auditor',
    description: 'Audit our DLC-based betting application for potential vulnerabilities.',
    price: '2.2M Sats',
    tags: ['Security', 'Solutions'],
  },
  {
    icon: '/assets/tech.png',
    title: 'Tech Whitepaper Editor',
    description: 'Refine and polish our technical whitepaper for a Bitcoin sidechian project.',
    price: '800k Sats',
    tags: ['Technical', 'Writing'],
  },
];

export default function TopOpportunities() {
  return (
    <section className="bg-[#FCF9F7] py-16">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1a1a1a]">Top Opportunities</h2>
            <p className="mt-1 text-sm text-[#666]">Curated featured jobs from the Bitcoin ecosystem</p>
          </div>
          <a href="#" className="text-sm font-bold text-[#8C4F00] hover:underline">
            View All Jobs
          </a>
        </div>

        {/* Featured Job + Profile */}
        <div className="mb-10">
          <FeaturedJob {...FEATURED} />
        </div>

        {/* Job Cards Grid (3 cols) */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {OPPORTUNITIES.map((job, idx) => (
            <JobCard key={idx} {...job} />
          ))}
        </div>
      </div>
    </section>
  );
}
