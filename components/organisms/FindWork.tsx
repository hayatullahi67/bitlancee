'use client';

import { useMemo, useState } from 'react';
import SearchInput from '../atoms/SearchInput';
import FilterButton from '../atoms/FilterButton';
import JobCard from '../atoms/JobCard';

const CATEGORIES = ['Development', 'Design & Creative', 'Sales & Marketing', 'Finance', 'Writing', 'Admin'];
const EXPERIENCE_LEVELS = ['All', 'Entry', 'Intermediate', 'Expert'];
const JOB_TYPES = ['All', 'Fixed', 'Hourly'];

const JOBS = [
  {
    id: 1,
    category: 'Development',
    experience: 'Expert',
    type: 'Fixed',
    icon: '/assets/dev.png',
    title: 'LND Integration Expert for Retail Terminal',
    description: 'Build Lightning integration for terminal fleet with offline fallback and security checks.',
    price: '2.4M Sats',
    tags: ['Lightning', 'Go', 'Remote'],
    label: 'Urgent',
    postedAt: '2 hours ago',
  },
  {
    id: 2,
    category: 'Design & Creative',
    experience: 'Intermediate',
    type: 'Fixed',
    icon: '/assets/creative.png',
    title: 'UI/UX Designer for Bitcoin Wallet App',
    description: 'Design a clean, low-friction wallet experience for first-time BTC users.',
    price: '850k Sats',
    tags: ['Figma', 'UI/UX', 'Fintech'],
    postedAt: '6 hours ago',
  },
  {
    id: 3,
    category: 'Development',
    experience: 'Expert',
    type: 'Hourly',
    icon: '/assets/tech.png',
    title: 'Sats-Back Rewards API Integration',
    description: 'Implement a sats-reward backend API linking OpenNode payments and loyalty rules.',
    price: '120k Sats/hr',
    tags: ['Node.js', 'API', 'REST'],
  },
  {
    id: 4,
    category: 'Sales & Marketing',
    experience: 'Entry',
    type: 'Fixed',
    icon: '/assets/sales.png',
    title: 'Growth Hacker for Bitcoin Education Platform',
    description: 'Run campaigns to acquire and onboard new users for Bitcoin skill tutorials.',
    price: '500k Sats',
    tags: ['Growth', 'SEO', 'Email'],
  },
  {
    id: 5,
    category: 'Writing',
    experience: 'Intermediate',
    type: 'Hourly',
    icon: '/assets/writting.png',
    title: 'Technical Copywriter for Lightning Docs',
    description: 'Craft high-quality documentation for new engineers adopting LN SDKs.',
    price: '95k Sats/hr',
    tags: ['Technical Writing', 'Documentation', 'Bitcoin'],
  },
  {
    id: 6,
    category: 'Finance',
    experience: 'Expert',
    type: 'Fixed',
    icon: '/assets/finance.png',
    title: 'Bitcoin Tax Compliance Specialist',
    description: 'Develop automated tax reporting tools for crypto transactions and wallet activities.',
    price: '1.2M Sats',
    tags: ['Tax', 'Compliance', 'Crypto'],
  },
  {
    id: 7,
    category: 'Admin',
    experience: 'Entry',
    type: 'Hourly',
    icon: '/assets/admin.png',
    title: 'Virtual Assistant for Bitcoin Startup',
    description: 'Manage schedules, communications, and administrative tasks for a growing BTC company.',
    price: '50k Sats/hr',
    tags: ['Admin', 'Communication', 'Organization'],
  },
  {
    id: 8,
    category: 'Design & Creative',
    experience: 'Intermediate',
    type: 'Fixed',
    icon: '/assets/creative.png',
    title: 'Brand Identity for Lightning Network App',
    description: 'Create a cohesive brand identity including logo, colors, and guidelines for LN app.',
    price: '650k Sats',
    tags: ['Branding', 'Logo', 'Lightning'],
  },
  {
    id: 9,
    category: 'Development',
    experience: 'Intermediate',
    type: 'Fixed',
    icon: '/assets/dev.png',
    title: 'Mobile Wallet Security Audit',
    description: 'Conduct comprehensive security audit for iOS/Android Bitcoin wallet application.',
    price: '900k Sats',
    tags: ['Security', 'Mobile', 'Audit'],
  },
  {
    id: 10,
    category: 'Sales & Marketing',
    experience: 'Expert',
    type: 'Hourly',
    icon: '/assets/sales.png',
    title: 'Partnership Manager for Crypto Exchange',
    description: 'Build and manage strategic partnerships with merchants and businesses for BTC adoption.',
    price: '150k Sats/hr',
    tags: ['Partnerships', 'B2B', 'Crypto'],
  },
];

export default function FindWork() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [budget, setBudget] = useState(1000000);
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All');

  const toggleCategory = (category: string) => {
    setSelectedCategory((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearAll = () => {
    setSelectedCategory([]);
    setBudget(1000000);
    setSelectedExperience('All');
    setSelectedJobType('All');
    setSearchTerm('');
  };

  const filteredJobs = useMemo(() => {
    return JOBS.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory.length === 0 || selectedCategory.includes(job.category);
      const matchesExperience = selectedExperience === 'All' || job.experience === selectedExperience;
      const matchesType = selectedJobType === 'All' || job.type === selectedJobType;
      const matchesBudget = job.price.includes('k')
        ? parseInt(job.price.replace(/[\D]/g, '')) * 1000 <= budget
        : true;

      return matchesSearch && matchesCategory && matchesExperience && matchesType && matchesBudget;
    });
  }, [searchTerm, selectedCategory, selectedExperience, selectedJobType, budget]);

  return (
    <section className="bg-[#FCF9F7] pt-[30px] pb-16 min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a]">Find Work</h1>
          <p className="mt-2 text-sm text-[#666]">Browse the latest Bitcoin-native freelance opportunities.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* <aside className="rounded-2xl border border-[#f0ebe3] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#333] uppercase tracking-wide">Filters</h2>
              <button
                onClick={clearAll}
                className="text-xs font-bold text-[#8C4F00] hover:text-[#F7931A]"
              >
                Clear All
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-[#333] uppercase tracking-wide mb-2">Category</h3>
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <label key={category} className="flex items-center gap-2 text-sm text-[#555]">
                    <input
                      type="checkbox"
                      checked={selectedCategory.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 accent-[#F7931A]"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-[#333] uppercase tracking-wide mb-2">Budget (Sats)</h3>
              <div className="mb-2 w-full rounded-xl bg-[#F6F3F1] p-2 text-xs text-[#666]">up to {budget.toLocaleString()}</div>
              <input
                type="range"
                min={10000}
                max={5000000}
                step={10000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-[#F7931A]"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-[#333] uppercase tracking-wide mb-2">Experience Level</h3>
              <div className="space-y-2">
                {EXPERIENCE_LEVELS.map((level) => (
                  <label key={level} className="inline-flex items-center gap-2 text-sm text-[#555]">
                    <input
                      type="radio"
                      name="experience"
                      value={level}
                      checked={selectedExperience === level}
                      onChange={() => setSelectedExperience(level)}
                      className="h-4 w-4 accent-[#F7931A]"
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-2">
              <h3 className="text-xs font-bold text-[#333] uppercase tracking-wide mb-2">Job Type</h3>
              <div className="flex gap-2">
                {JOB_TYPES.map((jobType) => (
                  <button
                    key={jobType}
                    onClick={() => setSelectedJobType(jobType)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${
                      selectedJobType === jobType
                        ? 'bg-[#F7931A] text-white'
                        : 'bg-[#F6F3F1] text-[#444] hover:bg-[#EFE8E0]'
                    }`}
                  >
                    {jobType}
                  </button>
                ))}
              </div>
            </div>
          </aside> */}

           <aside className="bg-[#F6F3F1] rounded-[48px] p-5 pl-[30px] h-fit pb-[40px]  ">
 
      {/* CATEGORY */}
      <div className="mb-5 mt-[10px]">
        <p className="text-[0.62rem] font-bold uppercase tracking-widest text-[#9A8F82] mb-3">
          Category
        </p>
        <div className="flex flex-col gap-2.5">
          {CATEGORIES.map((cat) => {
            const checked = selectedCategory.includes(cat);
            return (
              <label key={cat} className="flex items-center gap-2.5 cursor-pointer">
                <span
                  onClick={() => toggleCategory(cat)}
                  className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                    checked
                      ? "bg-[#8C4F00]"
                      : "border border-[#C4B8A8] bg-transparent"
                  }`}
                >
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.8 7L9 1"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-[#555]">{cat}</span>
              </label>
            );
          })}
        </div>
      </div>
 
      {/* BUDGET */}
      <div className="mb-5">
        <p className="text-[0.62rem] font-bold uppercase tracking-widest text-[#554335] mb-3">
          Budget (Sats)
        </p>
        <input
          type="range"
          min={1000}
          max={10000000}
          step={1000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-[#554335]"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[0.68rem] text-[#554335]">1k Sats</span>
          <span className="text-[0.68rem] text-[#554335]">10M Sats</span>
        </div>
      </div>
 
      {/* EXPERIENCE LEVEL */}
      <div className="mb-5">
        <p className="text-[0.62rem] font-bold uppercase tracking-widest text-[#554335] mb-3">
          Experience Level
        </p>
        <div className="flex flex-col gap-2.5">
          {EXPERIENCE_LEVELS.map((level) => {
            const selected = selectedExperience === level;
            return (
              <label key={level} className="flex items-center gap-2.5 cursor-pointer">
                <span
                  onClick={() => setSelectedExperience(level)}
                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    selected
                      ? "bg-[#8C4F00]"
                      : "border border-[#C4B8A8] bg-transparent"
                  }`}
                >
                  {selected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                  )}
                </span>
                <span className="text-sm text-[#555]">{level}</span>
              </label>
            );
          })}
        </div>
      </div>
 
      {/* JOB TYPE */}
      <div className="mb-5">
        <p className="text-[0.62rem] font-bold uppercase tracking-widest text-[#554335] mb-3">
          Job Type
        </p>
        <div className="flex gap-2">
          {JOB_TYPES.map((jt) => {
            const active = selectedJobType === jt;
            return (
              <button
                key={jt}
                onClick={() => setSelectedJobType(jt)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "bg-white text-[#1B1C1B] shadow-sm"
                    : "bg-transparent text-[#777] hover:bg-white/50"
                }`}
              >
                {jt}
              </button>
            );
          })}
        </div>
      </div>
 
      {/* CLEAR ALL */}
      <button
        onClick={clearAll}
        className="w-full rounded-full bg-[#E4DDD4] hover:bg-[#D9D0C6] text-[#666] text-sm font-medium py-2.5 transition-colors"
      >
        Clear All Filters
      </button>
    </aside>

          {/* <main>
            <div className="mb-6 w-full max-w-lg">
              <SearchInput
                placeholder="Search for bitcoin jobs, stacks, or keywords..."
              />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[#666]"><span className="font-bold text-[#1a1a1a]">{filteredJobs.length}</span> results found</p>
              <button className="rounded-full px-4 py-2 text-xs font-semibold text-[#8C4F00] bg-[#F6F3F1]">Newest First</button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {filteredJobs.length ? (
                filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    icon={job.icon}
                    title={job.title}
                    description={job.description}
                    price={job.price}
                    tags={job.tags}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-[#ece7dd] bg-white p-8 text-center text-[#777]">
                  No jobs match your filters.
                </div>
              )}
            </div>
          </main> */}

          <main>
  {/* Header bar */}
  <div className="mb-5 w-full ">
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]"
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        placeholder="Search for bitcoin-related jobs, stacks, or keywords..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full rounded-full  bg-[#F6F3F1] h-[54px] pl-9 pr-4 text-sm text-[#333] placeholder-[#aaa] outline-none focus:border-[#c8a97e]"
      />
    </div>
  </div>

  {/* Title + sort row */}
  <div className="mb-1">
    <h2 className="text-[20px] sm:text-[24px] md:text-[30px] font-semibold text-[#1B1C1B]">Available Jobs</h2>
  </div>
  <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
    <p className="text-[13px] sm:text-[14px] md:text-[16px] text-[#554335]">
      {filteredJobs.length} active opportunities in the Circular Economy
    </p>
    <div className="flex items-center gap-1 text-[12px] sm:text-[13px] md:text-[14px] text-[#554335]">
      <span>Sort by:</span>
      <div className='bg-[#F0EDEB] h-[32px] sm:h-[34px] flex items-center px-3 sm:px-[15px] rounded-[999px]'>
        <button className="flex items-center gap-1 font-semibold text-[#1B1C1B]">
        Newest First
        <svg width="10" height="10" className="sm:w-[12px] sm:h-[12px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      </div>
      
    </div>
  </div>

  {/* Job list — single column like the screenshot */}
  <div className="flex flex-col gap-4">
    {filteredJobs.length ? (
      filteredJobs.map((job) => (
        <JobCard
          key={job.id}
          icon={job.icon}
          title={job.title}
          description={job.description}
          price={job.price}
          tags={job.tags}
          variant="findwork"
          titleClassName="text-[#1B1C1B] text-[16px] sm:text-[19px] font-bold text-[#333]"
          descriptionClassName="text-sm sm:text-base text-[#666]"
          priceClassName="text-[#8C4F00] !text-[12px] sm:!text-[15px]"
          tagsClassName="bg-[#E0E0E0] text-[#222] text-[8px] sm:text-[10px]"
        />
      ))
    ) : (
      <div className="rounded-2xl border border-[#ece7dd] bg-white p-8 text-center text-[#777]">
        No jobs match your filters.
      </div>
    )}
  </div>
</main>
        </div>
      </div>
    </section>
  );
}
