'use client';

import React, { useMemo, useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Bookmark, 
  CircleDollarSign,
  ArrowUpRight,
  ChevronDown,
  Briefcase,
  Zap,
  Globe
} from 'lucide-react';

const CATEGORIES = ['Development', 'Design', 'Marketing', 'Finance', 'Writing'];

const MOCK_JOBS = [
  {
    id: 1,
    title: 'Lightning Network Integration for POS',
    client: 'SatoshiLab',
    price: '2.4M Sats',
    type: 'Fixed Price',
    experience: 'Expert',
    postedAt: '2h ago',
    description: 'Build Lightning integration for terminal fleet with offline fallback and security checks.',
    tags: ['Lightning', 'Go', 'Remote'],
    urgent: true
  },
  {
    id: 2,
    title: 'UI/UX Designer for Bitcoin Wallet App',
    client: 'BitFlow',
    price: '850k Sats',
    type: 'Fixed',
    experience: 'Intermediate',
    postedAt: '6h ago',
    description: 'Design a clean, low-friction wallet experience for first-time BTC users.',
    tags: ['Figma', 'UI/UX', 'Fintech'],
    urgent: false
  },
  {
    id: 3,
    title: 'Smart Contract Audit for LN Rewards',
    client: 'BlockSecure',
    price: '1.2M Sats',
    type: 'Fixed',
    experience: 'Expert',
    postedAt: '1d ago',
    description: 'Conduct comprehensive security audit for rewards platform on Bitcoin L2.',
    tags: ['Rust', 'Security', 'L2'],
    urgent: false
  }
];

export default function JobFeedContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter(job => 
      (activeCategory === 'All' || job.tags.includes(activeCategory) || job.title.includes(activeCategory)) &&
      (job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       job.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, activeCategory]);

  return (
    <div className=" mx-5 my-10  space-y-8 bg-[#fcfcfb] min-h-screen">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tight">Job Feed</h1>
          <p className="text-gray-500 font-medium">Browse and apply to the best Bitcoin-native opportunities.</p>
        </div>
        
        <div className="flex gap-4">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg active:scale-95">
             My Saved Jobs
          </button>
        </div>
      </header>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for bitcoin jobs, stacks, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-white border border-gray-100 px-6 py-4 rounded-2xl font-bold text-sm text-[#1a1a1a] hover:bg-orange-50 transition-all shadow-sm">
          <Filter className="w-4 h-4 text-orange-600" />
          Filter
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-6">
        
        {/* MAIN FEED */}
        <div className="space-y-6">
          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all border ${
                  activeCategory === cat 
                    ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' 
                    : 'bg-white text-gray-500 border-gray-100 hover:border-orange-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobFeedCard key={job.id} job={job} />
              ))
            ) : (
              <div className="bg-white rounded-[40px] border border-orange-100 border-dashed p-10 text-center">
                <Search className="w-12 h-12 text-orange-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold">No results found</h3>
                <p className="text-gray-400 text-sm">Try a different search term or filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JobFeedCard({ job }: { job: any }) {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-6 md:p-7 shadow-sm transition-all hover:shadow-xl hover:border-orange-200 group cursor-default relative overflow-hidden">
      {job.urgent && (
        <div className="absolute top-0 right-0">
          <div className="bg-orange-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-lg">
            Urgent
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-[22px] bg-orange-50 group-hover:bg-orange-500 transition-all group-hover:rotate-6">
           <Zap className="w-7 h-7 text-orange-600 group-hover:text-white" />
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-4">
               <h3 className="text-xl font-black text-[#1a1a1a] group-hover:text-orange-600 transition-colors">{job.title}</h3>
               <div className="text-xl font-black text-[#1a1a1a]">{job.price}</div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {job.client}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {job.postedAt}</span>
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Remote</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed font-medium line-clamp-2">
            {job.description}
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black rounded-lg uppercase tracking-widest group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-orange-50 hover:text-orange-500 transition-all border border-transparent hover:border-orange-100 flex-shrink-0">
                <Bookmark className="w-5 h-5 fill-none" />
              </button>
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg active:scale-95 group/btn border border-transparent">
                Apply Now
                <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
