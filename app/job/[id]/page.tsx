'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  Zap,
  CheckCircle,
  ShieldCheck,
  Globe,
  Star,
  MapPin,
  Bookmark,
  Bold,
  Italic,
  Link2,
  ArrowLeft
} from 'lucide-react';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { addDoc, collection, doc, getDoc, getDocs, increment, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  const [coverLetter, setCoverLetter] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('20');
  const [hourlyRate, setHourlyRate] = useState('150,000');
  const [fixedPrice, setFixedPrice] = useState('1,000,000');

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(firebaseDb, 'jobs', jobId));
        if (!snap.exists()) {
          setJob(null);
          setLoading(false);
          return;
        }
        const data = snap.data() as any;
        setJob({ id: snap.id, ...data });
      } finally {
        setLoading(false);
      }
    };
    if (jobId) loadJob();
  }, [jobId]);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      if (!user || !job?.id) return;
      const proposalsQuery = query(
        collection(firebaseDb, 'proposals'),
        where('jobId', '==', job.id),
        where('freelancerId', '==', user.uid)
      );
      const snap = await getDocs(proposalsQuery);
      setHasApplied(!snap.empty);
    });
    return () => unsubscribe();
  }, [job?.id]);

  if (loading) return <div className="p-6 sm:p-10 text-center">Loading job...</div>;
  if (!job) return <div className="p-6 sm:p-10 text-center">Job not found</div>;

  const budgetLabel =
    job?.budget && job.budget.toLowerCase().includes('sats')
      ? job.budget
      : `${job?.budget ?? ''} Sats`;
  const skills = Array.isArray(job?.skills) ? job.skills : [];
  const postedAt = job?.createdAt?.seconds
    ? `${Math.max(1, Math.round((Date.now() - job.createdAt.seconds * 1000) / 3600000))} hours ago`
    : 'Recently';
  const pricingType = job?.jobType === 'Hourly' ? 'Hourly' : 'Fixed Price';

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans text-[#1a1a1a]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Back to Job Feed Button */}
        <div className="mb-4 sm:mb-6">
          <Link href="/freelancer/dashboard/job-feed">
            <button className="flex items-center gap-2 text-[#CC7000] hover:text-[#A85C00] font-bold text-sm sm:text-base transition-colors">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Back to Job Feed
            </button>
          </Link>
        </div>

        <div>
             <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="bg-[#FEF3E2] text-[#92400E] text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest">
                  {job.status ?? 'Active Posting'}
                </span>
                <span className="text-xs text-gray-400">Posted {postedAt}</span>
              </div>
              <h1 className="text-[28px] sm:text-[40px] lg:text-[60px] font-bold leading-tight mb-3 sm:mb-4 tracking-tight">
                {job.title}
              </h1>
              {/* Quick Stats Row */}
              <div className="flex flex-wrap gap-4 sm:gap-6 lg:gap-8 mb-2">
                {/* Budget */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FEF3E2] flex items-center justify-center">
                    <span className="font-extrabold text-[#92400E] text-sm sm:text-base">$</span>
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-extrabold tracking-widest">Budget</p>
                    <p className="font-bold text-[13px] sm:text-[15px]">{budgetLabel}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#1D4ED8]" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-extrabold tracking-widest">Location</p>
                    <p className="font-bold text-[13px] sm:text-[15px]">Remote (Global)</p>
                  </div>
                </div>

                {/* Client Tier */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#16A34A]" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-extrabold tracking-widest">Client Tier</p>
                    <p className="font-bold text-[13px] sm:text-[15px]">Top Rated</p>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

          {/* LEFT COLUMN (8/12) */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-5">


            {/* Job Header Card (now only description and tags) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm border border-[#e8e6e1]">

              {/* Job Description */}
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-base sm:text-lg font-extrabold">Job Description</h2>
                <p className="text-gray-500 leading-relaxed text-sm break-all whitespace-pre-wrap overflow-hidden">
  {job.description?.replace(/\s{2,}/g, ' ').trim() ?? 'No description provided for this role yet.'}
</p>

                {/* Tags */}
                {skills.length ? (
                  <div className="pt-3 sm:pt-4">
                    <p className="text-[8px] sm:text-[9px] font-extrabold uppercase text-gray-400 mb-2 sm:mb-3 tracking-widest">Required Expertise</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {skills.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 sm:px-4 py-1 sm:py-2 bg-[#F3F2EF] rounded-full text-xs sm:text-sm font-medium text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Proposal Submission Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm border border-[#e8e6e1]">
              {/* Header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-7">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-orange-600 to-orange-400 to-[#F7931A] flex items-center justify-center">
                  <Send className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold">Submit Your Proposal</h2>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Cover Letter */}
                <div>
                  <label className="block text-[8px] sm:text-[9px] font-extrabold uppercase text-gray-400 mb-2 tracking-widest">
                    Proposal Cover Letter
                  </label>
                  <div className="relative">
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Describe your experience with Bitcoin protocols and why you're a fit for this role..."
                      className="w-full bg-[#FDFCFB] border border-[#ece7df] rounded-xl sm:rounded-2xl p-4 sm:p-5 text-sm min-h-[150px] sm:min-h-[180px] focus:outline-none focus:ring-2 focus:ring-orange-400/30 resize-none placeholder:text-gray-300"
                    />
                    {/* Formatting toolbar */}
                    <div className="absolute bottom-2 sm:bottom-3 right-3 sm:right-4 flex items-center gap-2 sm:gap-3 text-gray-300">
                      <Bold className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-gray-500 transition-colors" />
                      <Italic className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-gray-500 transition-colors" />
                      <Link2 className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-gray-500 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Bid Amount + Delivery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[8px] sm:text-[9px] font-extrabold uppercase text-gray-400 mb-2 tracking-widest">
                      {pricingType === 'Hourly' ? 'Hourly Rate (Sats/hr)' : 'Fixed Price (Sats)'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={pricingType === 'Hourly' ? hourlyRate : fixedPrice}
                        onChange={(e) =>
                          pricingType === 'Hourly'
                            ? setHourlyRate(e.target.value)
                            : setFixedPrice(e.target.value)
                        }
                        className="w-full bg-[#FDFCFB] border border-[#ece7df] rounded-lg sm:rounded-xl px-3 sm:px-4 py-3 sm:py-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                      />
                      <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[10px] sm:text-[11px] font-extrabold text-[#B45309] tracking-wider">
                        SATS
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1 sm:mt-2">
                      Share your {pricingType === 'Hourly' ? 'hourly' : 'project'} budget in sats.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[8px] sm:text-[9px] font-extrabold uppercase text-gray-400 mb-2 tracking-widest">
                      Hours Per Week
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={hoursPerWeek}
                        onChange={(e) => setHoursPerWeek(e.target.value)}
                        className="w-full bg-[#FDFCFB] border border-[#ece7df] rounded-lg sm:rounded-xl px-3 sm:px-4 py-3 sm:py-4 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                        placeholder="e.g. 20"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer: fee note + CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 sm:pt-5 border-t border-[#f0ede8] gap-3 sm:gap-0">
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-gray-400">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-300 flex items-center justify-center text-[7px] sm:text-[8px] shrink-0">
                      i
                    </div>
                    5% Bitlance platform fee applies to this contract.
                  </div>
                  <button
                    onClick={async () => {
                      const user = firebaseAuth.currentUser;
                      if (!user) {
                        setErrorMessage('Please log in to submit a proposal.');
                        return;
                      }
                      if (hasApplied) {
                        setErrorMessage('You already submitted a proposal for this job.');
                        return;
                      }
                      const proposedAmount =
                        pricingType === 'Hourly' ? hourlyRate.trim() : fixedPrice.trim();
                      if (!coverLetter.trim() || !proposedAmount) {
                        setErrorMessage('Please complete your proposal details.');
                        return;
                      }
                      setSubmitState('submitting');
                      setErrorMessage('');
                      try {
                        const proposalsQuery = query(
                          collection(firebaseDb, 'proposals'),
                          where('jobId', '==', job.id),
                          where('freelancerId', '==', user.uid)
                        );
                        const existing = await getDocs(proposalsQuery);
                        if (!existing.empty) {
                          setHasApplied(true);
                          setErrorMessage('You already submitted a proposal for this job.');
                          setSubmitState('idle');
                          return;
                        }

                        const allUsersSnap = await getDoc(doc(firebaseDb, 'all_users', user.uid));
                        const freelancersSnap = await getDoc(doc(firebaseDb, 'freelancers', user.uid));
                        const allData = allUsersSnap.exists() ? (allUsersSnap.data() as any) : {};
                        const freeData = freelancersSnap.exists() ? (freelancersSnap.data() as any) : {};
                        const freelancerName = allData.fullName ?? user.displayName ?? 'Freelancer';
                        const clientName =
                          job.clientId
                            ? ((await getDoc(doc(firebaseDb, 'all_users', job.clientId))).data() as any)?.fullName ??
                              job.clientName ??
                              job.clientCompany ??
                              'Client'
                            : job.clientName ?? job.clientCompany ?? 'Client';

                        await addDoc(collection(firebaseDb, 'proposals'), {
                          jobId: job.id,
                          clientId: job.clientId ?? '',
                          jobTitle: job.title ?? 'Job Proposal',
                          clientName,
                          freelancerId: user.uid,
                          freelancerName,
                          freelancerTitle: freeData.title ?? 'Professional',
                          cover: coverLetter.trim(),
                          rate: proposedAmount,
                          pricingType,
                          hourlyRate: pricingType === 'Hourly' ? proposedAmount : '',
                          fixedPrice: pricingType === 'Hourly' ? '' : proposedAmount,
                          hoursPerWeek: hoursPerWeek.trim(),
                          availability: freeData.availability ?? 'Available',
                          rating: freeData.rating ?? 5,
                          status: 'submitted',
                          createdAt: serverTimestamp(),
                          updatedAt: serverTimestamp(),
                        });

                        await updateDoc(doc(firebaseDb, 'jobs', job.id), {
                          proposals: increment(1),
                          updatedAt: serverTimestamp(),
                        });

                        setSubmitState('done');
                        setCoverLetter('');
                        setHourlyRate('150,000');
                        setFixedPrice('1,000,000');
                        setHoursPerWeek('20');
                        setHasApplied(true);
                      } catch {
                        setErrorMessage('Unable to submit proposal right now.');
                      } finally {
                        setSubmitState('idle');
                      }
                    }}
                    disabled={submitState === 'submitting' || hasApplied}
                    className="bg-gradient-to-r from-orange-600 to-orange-400 to-[#F7931A] active:scale-95 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-sm transition-all shadow-md w-full sm:w-auto disabled:opacity-70"
                  >
                    {hasApplied ? 'Applied' : submitState === 'submitting' ? 'Sending...' : 'Send Proposal'}
                  </button>
                </div>
                {errorMessage ? (
                  <p className="text-[11px] text-red-600">{errorMessage}</p>
                ) : null}
                {submitState === 'done' ? (
                  <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[11px] text-green-700">
                    Proposal submitted successfully.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (4/12) */}
          <div className="lg:col-span-4">
            <div className="bg-[#ECE9E2] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-7">
              {/* Action Card */}
              <div>
                <button
                  disabled={hasApplied}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-400 to-[#F7931A] hover:from-[#A85C00] hover:to-[#A85C00] active:scale-95 text-white py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md mb-2 sm:mb-3 disabled:opacity-70"
                >
                  {hasApplied ? 'Applied' : 'Apply Now'} <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                </button>
                <button className="w-full bg-white hover:bg-gray-100 text-[#1a1a1a] py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base border border-[#e0e0e0] flex items-center justify-center gap-2 transition-all shadow-sm">
                  <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" /> Save Job
                </button>
              </div>

              <div className="space-y-1 sm:space-y-2 px-1">
                {[
                  { label: 'Proposals', value: '15 to 20' },
                  { label: 'Connects Required', value: '6 Sats' },
                  { label: 'Active Interviews', value: '3' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm sm:text-[15px]">
                    <span className="text-gray-600 font-medium">{label}</span>
                    <span className="font-bold text-[#1a1a1a]">{value}</span>
                  </div>
                ))}
              </div>

              {/* About Client Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 shadow-sm border border-[#e8e6e1] mt-1 sm:mt-2">
                <p className="text-[8px] sm:text-[9px] font-extrabold uppercase text-gray-400 mb-4 sm:mb-6 tracking-widest">About the Client</p>
                {/* Client Identity */}
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0C2D2B] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-[8px] sm:text-[9px] font-extrabold">LL</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm">Lightning Labs Inc.</h4>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#CC7000] text-[#CC7000]" />
                      ))}
                      <span className="text-xs font-bold ml-1 text-gray-700">4.9</span>
                    </div>
                  </div>
                </div>
                {/* Client Details */}
                <div className="space-y-3 sm:space-y-4 text-sm">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-800">San Francisco, USA</p>
                      <p className="text-xs text-gray-400">10:45 AM local time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-gray-400 font-bold mt-0.5 shrink-0 text-sm sm:text-base leading-none">$</span>
                    <div>
                      <p className="font-bold text-gray-800">85M+ Sats Spent</p>
                      <p className="text-xs text-gray-400">42 Jobs Posted</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#16A34A] shrink-0" />
                    <p className="font-bold text-gray-800">Payment Verified</p>
                  </div>
                  <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-extrabold pt-1 tracking-widest">
                    Member since Jan 2021
                  </p>
                </div>
                <button className="w-full mt-5 sm:mt-7 text-[#CC7000] hover:text-[#A85C00] font-bold text-sm transition-colors">
                  View Company Profile
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
