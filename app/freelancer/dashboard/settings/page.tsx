'use client';

import React, { useState } from 'react';
import FreelancerSidebar from '@/components/molecules/FreelancerSidebar';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: 'Satoshi Nakamoto',
    email: 'satoshi@bitlance.com',
    bio: 'Experienced Bitcoin developer and Lightning Network expert.',
    skills: ['Rust', 'Bitcoin Core', 'Lightning Network'],
    hourlyRate: 150,
    location: 'Remote',
    title: 'Protocol Engineer & Distributed Systems Architect',
    visibility: true,
  });

  const handleProfileUpdate = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      <div className="flex">
        {/* Sidebar */}
        <FreelancerSidebar active="/freelancer/dashboard/settings" />

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="h-screen overflow-y-auto pt-4 md:pt-0 bg-[#F7F6F3]">
            <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-8">
              {/* Precision Profile Card (Upwork-style) */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-6 md:gap-8 items-center">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                    <span className="text-white text-3xl font-black"></span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-700" />
                        Verified Professional
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">{profile.name}</h1>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-widest text-gray-400">Professional Title</label>
                        <input
                          value={profile.title ?? 'Protocol Engineer & Distributed Systems Architect'}
                          onChange={(e) => handleProfileUpdate('title', e.target.value)}
                          className="w-full min-w-0 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-widest text-gray-400">Location Reference</label>
                        <input
                          value={profile.location}
                          onChange={(e) => handleProfileUpdate('location', e.target.value)}
                          className="w-full min-w-0 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary + Core Expertise + Visibility */}
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Professional Summary</h2>
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Markdown enabled</span>
                  </div>
                  <textarea
                    rows={6}
                    value={profile.bio}
                    onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="mt-3 text-sm text-gray-500">Tip: Use bullet points and clear achievements to improve your profile score.</p>
                </section>

                <section className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-base font-bold text-slate-900 mb-3">Core Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span key={skill} className="text-xs font-semibold px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-slate-700">{skill}</span>
                      ))}
                      <button
                        onClick={() => handleProfileUpdate('skills', [...profile.skills, 'New Skill'])}
                        className="text-xs font-semibold text-orange-600 border border-orange-200 bg-orange-50 px-3 py-1 rounded-full hover:bg-orange-100"
                      >
                        + Add Skill
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-base font-bold text-slate-900 mb-3">Public Profile Visibility</h3>
                    <p className="text-sm text-gray-600 mb-4">Allow your profile to be indexed and searched by vetted clients.</p>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.visibility ?? true}
                        onChange={(e) => handleProfileUpdate('visibility', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:bg-orange-600 transition-all"></div>
                      <span className="absolute left-1 top-[3px] h-6 w-6 bg-white rounded-full transition-transform peer-checked:translate-x-7 border border-gray-200"></span>
                    </label>
                  </div>
                </section>
              </div>

              <div className="bg-transparent rounded-xl p-0">
                <div className="flex flex-wrap gap-3 justify-end">
                  <button className="px-6 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50">Discard Changes</button>
                  <button className="px-6 py-2 bg-amber-700 text-white font-semibold rounded-lg hover:bg-amber-800">Save Precision Profile</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}