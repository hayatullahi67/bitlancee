'use client';

import React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
  sender: {
    name: string;
    avatar: string;
    isOnline: boolean;
  };
  onBack: () => void;
}

export default function ChatHeader({ sender, onBack }: ChatHeaderProps) {
  return (
    <div className="bg-white border-b border-[#e8e6e1] px-6 py-3 flex items-center gap-3">
      {/* Back button - mobile/tablet only */}
      <button
        onClick={onBack}
        className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      {/* Avatar */}
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-[#e8dfd4] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
          <img
            src={sender.avatar}
            alt={sender.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#8C4F00\" strokeWidth=\"1.5\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 20c0-4 3.6-7 8-7s8 3 8 7\"/></svg>`;
            }}
          />
        </div>
        {/* Online indicator */}
        {sender.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>

      {/* Name and status */}
      <div className="flex flex-col min-w-0">
        <h2 className="font-bold text-[#1a1a1a] truncate text-base">{sender.name}</h2>
        <span className="text-xs text-green-500 font-medium">● Online</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* View Profile and menu */}
      <button className="text-sm font-medium text-[#232323] hover:underline mr-2">View Profile</button>
      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  );
}