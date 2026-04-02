'use client';

import React, { useState } from 'react';
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
import { MOCK_JOBS } from '../../../lib/jobs';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = parseInt(params.id as string);
  const job = MOCK_JOBS.find(j => j.id === jobId);

  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('1,000,000');

  if (!job) return <div className="p-6 sm:p-10 text-center">Job not found</div>;

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
                  Active Posting
                </span>
                <span className="text-xs text-gray-400">Posted 2 hours ago</span>
              </div>
              <h1 className="text-[28px] sm:text-[40px] lg:text-[60px] font-bold leading-tight mb-3 sm:mb-4 tracking-tight">
                Senior Rust Engineer for<br />Lighting Network Protocol Layer
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
                    <p className="font-bold text-[13px] sm:text-[15px]">1,250,000 <span className="text-[#B45309]">Sats</span></p>
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
                    <p className="font-bold text-[13px] sm:text-[15px]">Top Rated Plus</p>
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
                <p className="text-gray-500 leading-relaxed text-sm">
                  We are seeking a highly skilled Senior Rust Engineer to join our core protocol team.
                  You will be responsible for designing and implementing high-performance networking
                  layers for our proprietary Lightning Network implementation.
                </p>
                <p className="text-gray-500 leading-relaxed text-sm">
                  The ideal candidate has a deep understanding of asynchronous programming in Rust,
                  distributed systems, and the underlying mechanics of the Bitcoin protocol. You will collaborate
                  closely with our cryptography team to ensure the highest security standards for channel
                  management and state transition logic.
                </p>

                <h3 className="font-extrabold text-sm mt-2">Key Responsibilities:</h3>
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-gray-500 text-sm">
                  <li>Design and maintain robust peer-to-peer networking protocols using tokio and libp2p.</li>
                  <li>Optimize channel state machine logic for low-latency transaction processing.</li>
                  <li>Implement comprehensive unit and integration tests for mission-critical payment paths.</li>
                  <li>Participate in deep architectural reviews and contribute to open-source Bitcoin standards (BOLTs).</li>
                </ul>

                {/* Tags */}
                <div className="pt-3 sm:pt-4">
                  <p className="text-[8px] sm:text-[9px] font-extrabold uppercase text-gray-400 mb-2 sm:mb-3 tracking-widest">Required Expertise</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {['Rust Lang', 'Bitcoin Protocol', 'Lightning Network', 'Async/Await', 'P2P Networking'].map(tag => (
                      <span
                        key={tag}
                        className="px-3 sm:px-4 py-1 sm:py-2 bg-[#F3F2EF] rounded-full text-xs sm:text-sm font-medium text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
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
                      Bid Amount (Sats)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full bg-[#FDFCFB] border border-[#ece7df] rounded-lg sm:rounded-xl px-3 sm:px-4 py-3 sm:py-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                      />
                      <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[10px] sm:text-[11px] font-extrabold text-[#B45309] tracking-wider">
                        SATS
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1 sm:mt-2">Estimated value: ~ $742.00 USD</p>
                  </div>

                  <div>
                    <label className="block text-[8px] sm:text-[9px] font-extrabold uppercase text-gray-400 mb-2 tracking-widest">
                      Expected Delivery
                    </label>
                    <div className="relative">
                      <select className="w-full bg-[#FDFCFB] border border-[#ece7df] rounded-lg sm:rounded-xl px-3 sm:px-4 py-3 sm:py-4 font-medium text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-400/30 cursor-pointer">
                        <option>Less than 1 month</option>
                        <option>1–3 months</option>
                        <option>3–6 months</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</div>
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
                  <button className="bg-gradient-to-r from-orange-600 to-orange-400 to-[#F7931A] active:scale-95 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-sm transition-all shadow-md w-full sm:w-auto">
                    Send Proposal
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (4/12) */}
          <div className="lg:col-span-4">
            <div className="bg-[#ECE9E2] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-7">
              {/* Action Card */}
              <div>
                <button className="w-full bg-gradient-to-r from-orange-600 to-orange-400 to-[#F7931A] hover:from-[#A85C00] hover:to-[#A85C00] active:scale-95 text-white py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md mb-2 sm:mb-3">
                  Apply Now <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
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