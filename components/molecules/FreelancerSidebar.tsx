'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface FreelancerSidebarProps {
  active?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Overview',
    href: '/freelancer/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Job Feed',
    href: '/freelancer/dashboard/job-feed',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 9h8M8 13h8M8 17h5" />
      </svg>
    ),
  },
  {
    label: 'Earnings',
    href: '/freelancer/dashboard/earnings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    label: 'Messages',
    href: '/freelancer/dashboard/messages',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/freelancer/dashboard/settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.35a1.65 1.65 0 0 0 1.51-1H10a2 2 0 0 1 4 0h.09A1.65 1.65 0 0 0 15.65 4a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20 8.6a1.65 1.65 0 0 0 1 1.51H21a2 2 0 0 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z" />
      </svg>
    ),
  },
];

export default function FreelancerSidebar({ active = '/freelancer/dashboard' }: FreelancerSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white rounded-xl border border-[#e7e2dc] shadow-sm text-[#8C4F00]"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        )}
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[50] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 w-[280px] h-screen bg-[#F5F0EB] flex flex-col px-4 py-8 gap-0 rounded-tr-[48px] rounded-br-[48px] transition-transform duration-300 ease-in-out shadow-sm overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Avatar + Name + Badge */}
        <div className="flex flex-col items-start gap-0.5 mb-10 px-1">
          <div className="w-14 h-14 rounded-full bg-[#e8dfd4] flex items-center justify-center mb-3 overflow-hidden border-2 border-white shadow-md">
            <img
              src="/assets/avatar.png"
              alt="Freelancer avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8C4F00" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`;
              }}
            />
          </div>
          <h3 className="text-base font-black text-[#1a1a1a] leading-tight">Satoshi Nakamoto</h3>
          <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest">Top Rated</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${isActive
                  ? 'bg-white text-[#1a1a1a] shadow-sm'
                  : 'text-[#6b6560] hover:bg-white/50 hover:text-[#1a1a1a]'
                }`}
              >
                <span className={isActive ? 'text-orange-500' : 'text-[#9e9690]'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Find Bitcoin Jobs Button */}
        <button className="mt-6 w-full mb-8 rounded-full bg-gradient-to-r from-orange-600 to-orange-400 text-white font-black text-sm py-4 tracking-wide hover:shadow-lg hover:shadow-orange-500/20 transition-all active:scale-95 shadow-md">
          Find Bitcoin Jobs
        </button>

        {/* Bottom: Help Center + Logout Area */}
        <div className="flex flex-col gap-1 border-t border-orange-100 pt-6">
          <Link
            href="/help"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[#6b6560] hover:bg-white/50 hover:text-[#1a1a1a] transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9e9690]">
              <circle cx="12" cy="12" r="9" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Help Center
          </Link>

          <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[#6b6560] hover:bg-white/50 hover:text-[#1a1a1a] transition-all w-full text-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9e9690]">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>

      </aside>
    </>
  );
}