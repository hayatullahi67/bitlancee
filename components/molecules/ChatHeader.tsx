'use client';

import React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatHeaderProps {
  sender: {
    name: string;
    avatar: string;
    isOnline: boolean;
    profileUrl?: string;
  };
  onBack: () => void;
}

export default function ChatHeader({ sender, onBack }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <div
      className="bg-[#F6F3F1] border-b border-[#e8e6e1] px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 min-h-[56px]"
      style={{ minHeight: '48px' }}
    >
      <button
        onClick={onBack}
        className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Back"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div className="relative">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#e8dfd4] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
          <img
            src={sender.avatar}
            alt={sender.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8C4F00" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
            }}
          />
        </div>
        {sender.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <h2 className="font-bold text-[#1a1a1a] truncate text-sm sm:text-base leading-tight">{sender.name}</h2>
        <span className={`text-xs font-medium leading-none ${sender.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
          {sender.isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button
          className="text-xs sm:text-sm font-medium text-[#232323] hover:underline mr-1 sm:mr-2 disabled:text-gray-400 disabled:no-underline"
          onClick={() => sender.profileUrl && router.push(sender.profileUrl)}
          disabled={!sender.profileUrl}
        >
          View Profile
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
