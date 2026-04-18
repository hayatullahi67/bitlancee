

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Bookmark, 
  ArrowUpRight,
  ChevronDown,
  Briefcase,
  Zap,
} from 'lucide-react';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';

const isNonEmptyString = (value: string | undefined): value is string =>
  !!value && value.trim().length > 0;

const getCategories = (items: JobFeedItem[]) =>
  Array.from(new Set(items.map((job) => job.category).filter(isNonEmptyString))).sort();

type JobFeedItem = {
  id: string;
  title: string;
  description: string;
  price: string;
  tags: string[];
  urgent?: boolean;
  client?: string;
  experience?: string;
  postedAt?: string;
  category?: string;
};

export default function JobFeedContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [jobs, setJobs] = useState<JobFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const jobsQuery = query(collection(firebaseDb, 'jobs'));
    const unsubscribe = onSnapshot(
      jobsQuery,
      (snapshot) => {
        const items: JobFeedItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          const createdAt = data.createdAt?.seconds ? data.createdAt.seconds * 1000 : 0;
          const postedAt = createdAt
            ? `${Math.max(1, Math.round((Date.now() - createdAt) / 3600000))}h ago`
            : 'Recently';
          const budget = data.budget ?? '';
          const price = budget?.trim()
            ? budget.toLowerCase().includes('sats')
              ? budget
              : `${budget} sats`
            : '';
          const rawDescription = data.description ?? '';
          const description = rawDescription.replace(/\s{2,}/g, ' ').trim();
          return {
            id: docSnap.id,
            title: data.title ?? 'Untitled Job',
            description,
            price,
            tags: Array.isArray(data.skills) ? data.skills : [],
            urgent: !!data.urgent,
            client: data.clientCompany || data.clientName || 'Client',
            experience: data.experienceLevel || 'All Levels',
            postedAt,
            category: data.category ?? '',
          };
        });
        setJobs(items);
        setLoading(false);
        setErrorMessage('');
      },
      () => {
        setLoading(false);
        setErrorMessage('Unable to load jobs right now.');
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribeSaved: (() => void) | undefined;
    const unsubscribeAuth = firebaseAuth.onAuthStateChanged((user) => {
      if (!user) {
        if (unsubscribeSaved) unsubscribeSaved();
        setSavedMap({});
        return;
      }
      setSavedLoading(true);
      const savedQuery = query(
        collection(firebaseDb, 'saved_jobs'),
        where('userId', '==', user.uid)
      );
      unsubscribeSaved = onSnapshot(
        savedQuery,
        (snapshot) => {
          const map: Record<string, boolean> = {};
          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data() as any;
            if (data.jobId) map[data.jobId] = true;
          });
          setSavedMap(map);
          setSavedLoading(false);
        },
        () => {
          setSavedLoading(false);
        }
      );
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeSaved) unsubscribeSaved();
    };
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(
      (job) =>
        (activeCategory === 'All' ||
          job.tags.includes(activeCategory) ||
          job.title.includes(activeCategory) ||
          job.category === activeCategory) &&
        (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, activeCategory, jobs]);

  return (
    <section className="bg-[#FCF9F7] py-16">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">

        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F7931A]/10 rounded-xl">
                <Zap className="w-6 h-6 text-[#F7931A]" />
              </div>
              <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight">Job Feed</h1>
            </div>
            <p className="text-[#6b6560] text-sm md:text-base font-medium">
              Browse and apply to the best Bitcoin-native opportunities.
            </p>
          </div>
          <button
            onClick={() => setIsSavedOpen((prev) => !prev)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-400 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] transition-all active:scale-95 group"
          >
            <Bookmark className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            {isSavedOpen ? "Back to Feed" : "My Saved Jobs"}
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
          {/* <button className="flex items-center justify-center gap-2 bg-white border border-[#ece7df] px-6 py-4 rounded-2xl font-bold text-sm text-[#1a1a1a] hover:bg-[#F7931A]/5 transition-all shadow-sm">
            <Filter className="w-4 h-4 text-[#F7931A]" />
            Filter
            <ChevronDown className="w-4 h-4 text-[#6b6560]" />
          </button> */}
        </div>

        {/* MAIN FEED */}
        <div className="space-y-6">
          {/* Category chips */}
          {!isSavedOpen ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['All', ...getCategories(jobs)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-orange-600 to-orange-400 text-white shadow-lg shadow-[#F7931A]/20'
                      : 'bg-white text-[#6b6560] border-[#ece7df]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : null}

          <div className="space-y-4">
            {!isSavedOpen ? (
              loading ? (
                <div className="bg-white rounded-3xl border border-[#ece7df] p-10 text-center text-[#6b6762]">
                  Loading jobs...
                </div>
              ) : errorMessage ? (
                <div className="bg-white rounded-3xl border border-[#F7931A]/20 p-10 text-center text-[#8C4F00]">
                  {errorMessage}
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <JobFeedCard
                    key={job.id}
                    job={job}
                    isSaved={!!savedMap[job.id]}
                    heightClass="min-h-[180px]"
                    onToggleSave={async () => {
                      const user = firebaseAuth.currentUser;
                      if (!user) {
                        alert('Please log in to save jobs.');
                        return;
                      }
                      const docId = `${user.uid}_${job.id}`;
                      if (savedMap[job.id]) {
                        await deleteDoc(doc(firebaseDb, 'saved_jobs', docId));
                      } else {
                        await setDoc(doc(firebaseDb, 'saved_jobs', docId), {
                          userId: user.uid,
                          jobId: job.id,
                          createdAt: serverTimestamp(),
                          updatedAt: serverTimestamp(),
                        });
                      }
                    }}
                  />
                ))
              ) : (
                <div className="bg-white rounded-3xl border border-[#F7931A]/20 border-dashed p-10 text-center">
                  <Search className="w-12 h-12 text-[#F7931A]/30 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[#1a1a1a]">No results found</h3>
                  <p className="text-[#6b6560] text-sm">Try a different search term or filter.</p>
                </div>
              )
            ) : (
              <div className="bg-white rounded-3xl border border-[#ece7df] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
                      Saved Jobs
                    </div>
                    <h2 className="mt-2 text-[20px] font-semibold text-[#1a1a1a]">Your saved opportunities</h2>
                    <p className="mt-1 text-[12px] text-[#6b6762]">
                      Review the jobs you bookmarked and apply when you are ready.
                    </p>
                  </div>
                </div>
                {savedLoading ? (
                  <div className="rounded-[14px] border border-[#EAE7E2] bg-[#FAF8F5] p-6 text-[12px] text-[#6b6762] text-center">
                    Loading saved jobs...
                  </div>
                ) : jobs.filter((job) => savedMap[job.id]).length ? (
                  <div className="space-y-4">
                    {jobs
                      .filter((job) => savedMap[job.id])
                      .map((job) => (
                        <JobFeedCard
                          key={`saved-${job.id}`}
                          job={job}
                          isSaved={!!savedMap[job.id]}
                          heightClass="min-h-[180px]"
                          onToggleSave={async () => {
                            const user = firebaseAuth.currentUser;
                            if (!user) return;
                            const docId = `${user.uid}_${job.id}`;
                            await deleteDoc(doc(firebaseDb, 'saved_jobs', docId));
                          }}
                          compact
                        />
                      ))}
                  </div>
                ) : (
                  <div className="rounded-[14px] border border-[#F7931A]/20 border-dashed bg-[#FFF8F2] p-8 text-center">
                    <Bookmark className="w-10 h-10 text-[#F7931A]/40 mx-auto mb-3" />
                    <h3 className="text-[16px] font-bold text-[#1a1a1a]">No saved jobs yet</h3>
                    <p className="text-[12px] text-[#6b6762]">Tap the bookmark icon on a job to save it.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function JobFeedCard({
  job,
  isSaved = false,
  onToggleSave,
  compact = false,
  heightClass = "",
}: {
  job: JobFeedItem;
  isSaved?: boolean;
  onToggleSave?: () => void;
  compact?: boolean;
  heightClass?: string;
}) {
  const router = useRouter();

  return (
    <div
      className={`bg-white rounded-3xl border border-[#ece7df] p-4 shadow-sm transition-all hover:shadow-xl hover:border-[#F7931A]/30 group overflow-hidden ${compact ? "md:p-4" : ""} ${heightClass}`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {job.urgent && (
            <span className="bg-[#FCF9F7] text-[#8C4F00] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Urgent
            </span>
          )}
          <span className="text-xs text-[#6b6560] font-medium">{job.postedAt}</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleSave) onToggleSave();
          }}
          className={`flex items-center justify-center h-9 w-9 rounded-full border transition-colors ${
            isSaved
              ? "bg-[#F7931A] text-white border-[#F7931A]"
              : "bg-white text-[#8C4F00] border-[#EAE7E2] hover:bg-[#F7F4F0]"
          }`}
          aria-label={isSaved ? "Unsave job" : "Save job"}
        >
          <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Title and price */}
      <div className="flex items-start justify-between gap-4 mb-1.5">
        <h3 className="text-lg font-bold text-[#1a1a1a] transition-colors flex-1 break-words min-w-0">
          {job.title}
        </h3>
        {job.price ? (
          <span className="text-[15px] font-bold text-[#8C4F00] whitespace-nowrap shrink-0">
            {job.price}
          </span>
        ) : null}
      </div>

      {/* Client info */}
      <div className="flex items-center gap-2 mb-2">
        <Briefcase className="w-4 h-4 text-[#6b6560] shrink-0" />
        <span className="text-sm font-medium text-[#6b6560] truncate">{job.client}</span>
        <span className="text-xs text-[#6b6560]">•</span>
        <span className="text-xs text-[#6b6560] whitespace-nowrap">{job.experience}</span>
      </div>

      {/* Description — capped at 2 lines, breaks long words */}
      {/* {job.description ? (
        <p className="text-sm text-[#6b6560] leading-relaxed mb-4 line-clamp-2 break-words overflow-hidden">
          {job.description}
        </p>
      ) : null} */}
      <p className="text-sm text-[#6b6560] leading-relaxed mb-2 overflow-hidden break-all" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
  {job.description}
</p>

      {/* Tags */}
      {job.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {job.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 bg-[#FCF9F7] text-[#6b6560] text-[10px] font-bold rounded-full border border-[#ece7df] group-hover:bg-[#F7931A]/10 group-hover:text-[#F7931A] group-hover:border-[#F7931A]/30 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {/* Apply button */}
      <div className="flex justify-end">
        <button
          onClick={() => router.push(`/job/${job.id}`)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-400 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 group/btn"
        >
          Apply Now
          <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
