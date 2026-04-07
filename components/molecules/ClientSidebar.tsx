"use client";

import React, { useState } from "react";
import Link from "next/link";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface ClientSidebarProps {
  active?: string;
}

const CLIENT_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Overview",
    href: "/client/dashboard",
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
    label: "Job Posts",
    href: "/client/dashboard/job-posts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <line x1="8" y1="7" x2="16" y2="7" />
        <line x1="8" y1="11" x2="16" y2="11" />
        <line x1="8" y1="15" x2="14" y2="15" />
      </svg>
    ),
  },
  {
    label: "Contracts",
    href: "/client/dashboard/contracts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    label: "Messages",
    href: "/client/dashboard/messages",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Payments",
    href: "/client/dashboard/payments",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/client/dashboard/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.35a1.65 1.65 0 0 0 1.51-1H10a2 2 0 0 1 4 0h.09A1.65 1.65 0 0 0 15.65 4a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20 8.6a1.65 1.65 0 0 0 1 1.51H21a2 2 0 0 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z" />
      </svg>
    ),
  },
  {
    label: "Help",
    href: "/client/dashboard/help",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export default function ClientSidebar({ active = "/client/dashboard" }: ClientSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-6 left-4 z-[60] p-2 bg-white rounded-xl border border-[#e7e2dc] shadow-sm text-[#8C4F00]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[50] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
        fixed lg:sticky top-0 left-0 z-50 w-[280px] h-[100vh] bg-[#F5F0EB] flex flex-col px-4 py-8 gap-0 rounded-tr-[48px] rounded-br-[48px] transition-transform duration-300 ease-in-out shadow-sm overflow-y-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 z-[60] p-2 bg-white rounded-xl border border-[#e7e2dc] shadow-sm text-[#8C4F00]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <Link href="/client/dashboard" onClick={() => setIsOpen(false)} className="flex flex-col items-start gap-0.5 mb-10 px-1">
          <div className="w-14 h-14 rounded-full bg-[#e8dfd4] flex items-center justify-center mb-3 overflow-hidden border-2 border-white shadow-md">
            <img
              src="/assets/avatar.png"
              alt="Client avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8C4F00" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`;
              }}
            />
          </div>
          <h3 className="text-base font-black text-[#1a1a1a] leading-tight">Atlas Ventures</h3>
          <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest">Client</p>
        </Link>

        <nav className="flex flex-col gap-1.5 flex-1">
          {CLIENT_SIDEBAR_ITEMS.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  isActive ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6560] hover:bg-white/50 hover:text-[#1a1a1a]"
                }`}
              >
                <span className={isActive ? "text-orange-500" : "text-[#9e9690]"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/client/dashboard/job-posts"
          onClick={() => setIsOpen(false)}
          className="mt-6 w-full mb-8 rounded-full bg-gradient-to-r from-orange-600 to-orange-400 text-white font-black text-sm py-4 tracking-wide hover:shadow-lg hover:shadow-orange-500/20 transition-all active:scale-95 shadow-md text-center"
        >
          Post a Job
        </Link>

        <div className="flex flex-col gap-1 border-t border-orange-100 pt-6">
          <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[#6b6560] hover:bg-white/50 hover:text-[#1a1a1a] transition-all w-full text-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9e9690]">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
