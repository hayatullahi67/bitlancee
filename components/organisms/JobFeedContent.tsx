'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { MOCK_JOBS } from '../../lib/jobs';

const CATEGORIES = ['Development', 'Design', 'Marketing', 'Finance', 'Writing'];

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
    <section className="bg-[#FCF9F7] py-16">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F7931A]/10 rounded-xl">
                <Zap className="w-6 h-6 text-[#F7931A]" />
              </div>
              <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight">Job Feed</h1>
            </div>
            <p className="text-[#6b6560] text-sm md:text-base font-medium">Browse and apply to the best Bitcoin-native opportunities.</p>
          </div>
          
          <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-400 to-[#F7931A] text-white px-8 py-4 rounded-2xl font-bold text-sm hover:shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] transition-all active:scale-95 group">
            <Bookmark className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            My Saved Jobs
          </button>
        </header>

        {/* SEARCH AND FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6560]" />
            <input 
              type="text" 
              placeholder="Search for bitcoin jobs, stacks, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#ece7df] rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F7931A]/10 focus:border-[#F7931A] transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-white border border-[#ece7df] px-6 py-4 rounded-2xl font-bold text-sm text-[#1a1a1a] hover:bg-[#F7931A]/5 transition-all shadow-sm">
            <Filter className="w-4 h-4 text-[#F7931A]" />
            Filter
            <ChevronDown className="w-4 h-4 text-[#6b6560]" />
          </button>
        </div>

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
                    ? 'bg-gradient-to-r from-orange-600 to-orange-400 text-white  shadow-lg shadow-[#F7931A]/20' 
                    : 'bg-white text-[#6b6560] border-[#ece7df]'
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
              <div className="bg-white rounded-3xl border border-[#F7931A]/20 border-dashed p-10 text-center">
                <Search className="w-12 h-12 text-[#F7931A]/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#1a1a1a]">No results found</h3>
                <p className="text-[#6b6560] text-sm">Try a different search term or filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function JobFeedCard({ job }: { job: any }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-3xl border border-[#ece7df] p-6 shadow-sm transition-all hover:shadow-xl hover:border-[#F7931A]/30 group">
      {/* Top row: Urgent badge and posted time */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {job.urgent && (
            <span className="bg-[#FCF9F7] text-[#8C4F00] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Urgent
            </span>
          )}
          <span className="text-xs text-[#6b6560] font-medium">{job.postedAt}</span>
        </div>
      </div>

      {/* Title and price */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-lg font-bold text-[#1a1a1a]  transition-colors flex-1">
          {job.title}
        </h3>
        <span className="text-[15px] font-bold text-[#8C4F00] whitespace-nowrap">{job.price}</span>
      </div>

      {/* Client info */}
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-4 h-4 text-[#6b6560]" />
        <span className="text-sm font-medium text-[#6b6560]">{job.client}</span>
        <span className="text-xs text-[#6b6560]">•</span>
        <span className="text-xs text-[#6b6560]">{job.experience}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-[#6b6560] leading-relaxed mb-4 line-clamp-2">
        {job.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {job.tags.map((tag: string) => (
          <span key={tag} className="px-3 py-1 bg-[#FCF9F7] text-[#6b6560] text-[10px] font-bold rounded-full border border-[#ece7df] group-hover:bg-[#F7931A]/10 group-hover:text-[#F7931A] group-hover:border-[#F7931A]/30 transition-colors">
            {tag}
          </span>
        ))}
      </div>

      {/* Apply button */}
      <div className="flex justify-end">
        <button 
          onClick={() => router.push(`/job/${job.id}`)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-400 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#F7931A] transition-all shadow-lg active:scale-95 group/btn"
        >
          Apply Now
          <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
