'use client';

import { useMemo, useState } from 'react';
import Header from '@/components/organisms/Header';
import Footer from '@/components/organisms/Footer';
import SearchInput from '@/components/atoms/SearchInput';
import FilterButton from '@/components/atoms/FilterButton';
import JobCard from '@/components/atoms/JobCard';

const CATEGORIES = ['Development', 'Design & Creative', 'Sales & Marketing', 'Finance', 'Writing', 'Admin'];
const EXPERIENCE_LEVELS = ['All', 'Entry', 'Intermediate', 'Expert'];
const JOB_TYPES = ['All', 'Freelancer', 'Available'];

const FREELANCERS = [
  {
    id: 1,
    category: 'Development',
    experience: 'Expert',
    type: 'Freelancer',
    icon: '/assets/dev.png',
    title: 'Senior Lightning Network Developer',
    description: 'Expert in Lightning Network integration, Go, and secure payment systems. 5+ years experience.',
    price: '120k-150k Sats/hr',
    tags: ['Lightning', 'Go', 'Remote'],
  },
  {
    id: 2,
    category: 'Design & Creative',
    experience: 'Intermediate',
    type: 'Freelancer',
    icon: '/assets/creative.png',
    title: 'UI/UX Designer - Bitcoin Apps',
    description: 'Specialized in creating low-friction, user-friendly wallet and fintech interfaces.',
    price: '80k-100k Sats/hr',
    tags: ['Figma', 'UI/UX', 'Fintech'],
  },
  {
    id: 3,
    category: 'Development',
    experience: 'Expert',
    type: 'Freelancer',
    icon: '/assets/tech.png',
    title: 'Backend API Developer - Node.js Specialist',
    description: 'Full-stack backend development with focus on scalable REST APIs and security.',
    price: '110k-140k Sats/hr',
    tags: ['Node.js', 'API', 'REST'],
  },
  {
    id: 4,
    category: 'Sales & Marketing',
    experience: 'Intermediate',
    type: 'Freelancer',
    icon: '/assets/sales.png',
    title: 'Growth Marketing Specialist',
    description: 'Expert in SEO, social media campaigns, and user acquisition for tech startups.',
    price: '70k-90k Sats/hr',
    tags: ['Growth', 'SEO', 'Email'],
  },
  {
    id: 5,
    category: 'Writing',
    experience: 'Expert',
    type: 'Freelancer',
    icon: '/assets/writting.png',
    title: 'Technical Writer - Bitcoin & Crypto',
    description: 'Specializing in clear documentation and technical guides for developers. 10+ years.',
    price: '85k-110k Sats/hr',
    tags: ['Technical Writing', 'Documentation', 'Bitcoin'],
  },
  {
    id: 6,
    category: 'Finance',
    experience: 'Expert',
    type: 'Freelancer',
    icon: '/assets/finance.png',
    title: 'Blockchain Tax & Compliance Expert',
    description: 'Specialize in crypto tax planning and regulatory compliance for businesses.',
    price: '130k-160k Sats/hr',
    tags: ['Tax', 'Compliance', 'Crypto'],
  },
  {
    id: 7,
    category: 'Development',
    experience: 'Intermediate',
    type: 'Freelancer',
    icon: '/assets/dev.png',
    title: 'Mobile Developer - iOS & Android',
    description: 'Expert in React Native and native mobile development for Bitcoin wallets.',
    price: '100k-130k Sats/hr',
    tags: ['Mobile', 'React Native', 'Bitcoin'],
  },
  {
    id: 8,
    category: 'Design & Creative',
    experience: 'Expert',
    type: 'Freelancer',
    icon: '/assets/creative.png',
    title: 'Brand & Identity Designer',
    description: 'Full branding solutions including logo design, brand guidelines, and visual identity.',
    price: '95k-125k Sats/hr',
    tags: ['Branding', 'Logo', 'Creative'],
  },
  {
    id: 9,
    category: 'Development',
    experience: 'Expert',
    type: 'Freelancer',
    icon: '/assets/tech.png',
    title: 'Security & Audit Specialist',
    description: 'Comprehensive security audits and penetration testing for blockchain applications.',
    price: '150k-180k Sats/hr',
    tags: ['Security', 'Audit', 'Blockchain'],
  },
  {
    id: 10,
    category: 'Sales & Marketing',
    experience: 'Expert',
    type: 'Freelancer',
    icon: '/assets/sales.png',
    title: 'Business Development Manager',
    description: 'Strategic partnerships, B2B sales, and business growth for crypto/fintech companies.',
    price: '120k-150k Sats/hr',
    tags: ['Partnerships', 'B2B', 'Strategy'],
  },
];

export default function FindFreelancers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All');

  const toggleCategory = (category: string) => {
    setSelectedCategory((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearAll = () => {
    setSelectedCategory([]);
    setSelectedExperience('All');
    setSelectedJobType('All');
    setSearchTerm('');
  };

  const filteredFreelancers = useMemo(() => {
    return FREELANCERS.filter((freelancer) => {
      const matchesSearch =
        freelancer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory.length === 0 || selectedCategory.includes(freelancer.category);
      const matchesExperience = selectedExperience === 'All' || freelancer.experience === selectedExperience;
      const matchesType = selectedJobType === 'All' || freelancer.type === selectedJobType;

      return matchesSearch && matchesCategory && matchesExperience && matchesType;
    });
  }, [searchTerm, selectedCategory, selectedExperience, selectedJobType]);

  return (
    <>
      <Header />
      <section className="bg-[#FCF9F7] pt-[120px] sm:pt-[140px] pb-16 min-h-screen">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a]">Find Freelancers</h1>
          <p className="mt-2 text-sm text-[#666]">Discover talented Bitcoin-native freelancers for your projects.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Filters */}
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

            {/* AVAILABILITY TYPE */}
            <div className="mb-5">
              <p className="text-[0.62rem] font-bold uppercase tracking-widest text-[#554335] mb-3">
                Availability
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

          {/* Main Content */}
          <main>
            {/* Search Bar */}
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
                  placeholder="Search for freelancers, skills, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-full  bg-[#F6F3F1] h-[54px] pl-9 pr-4 text-sm text-[#333] placeholder-[#aaa] outline-none focus:border-[#c8a97e]"
                />
              </div>
            </div>

            {/* Title + sort row */}
            <div className="mb-1">
              <h2 className="text-[20px] sm:text-[24px] md:text-[30px] font-semibold text-[#1B1C1B]">Available Freelancers</h2>
            </div>
            <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <p className="text-[13px] sm:text-[14px] md:text-[16px] text-[#554335]">
                {filteredFreelancers.length} verified professionals ready to work
              </p>
              <div className="flex items-center gap-1 text-[12px] sm:text-[13px] md:text-[14px] text-[#554335]">
                <span>Sort by:</span>
                <div className='bg-[#F0EDEB] h-[32px] sm:h-[34px] flex items-center px-3 sm:px-[15px] rounded-[999px]'>
                  <button className="flex items-center gap-1 font-semibold text-[#1B1C1B]">
                    Top Rated
                    <svg width="10" height="10" className="sm:w-[12px] sm:h-[12px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Freelancer list */}
            <div className="flex flex-col gap-4">
              {filteredFreelancers.length ? (
                filteredFreelancers.map((freelancer) => (
                  <JobCard
                    key={freelancer.id}
                    icon={freelancer.icon}
                    title={freelancer.title}
                    description={freelancer.description}
                    price={freelancer.price}
                    tags={freelancer.tags}
                    variant="findwork"
                    isFreelancer={true}
                    titleClassName="text-[#1B1C1B] text-[16px] sm:text-[19px] font-bold text-[#333]"
                    descriptionClassName="text-sm sm:text-base text-[#666]"
                    priceClassName="text-[#8C4F00] !text-[12px] sm:!text-[15px]"
                    tagsClassName="bg-[#E0E0E0] text-[#222] text-[8px] sm:text-[10px]"
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-[#ece7dd] bg-white p-8 text-center text-[#777]">
                  No freelancers match your filters.
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      </section>
      <Footer />
    </>
  );
}
