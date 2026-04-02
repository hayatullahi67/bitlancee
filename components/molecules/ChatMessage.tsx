'use client';

import React from 'react';

interface Attachment {
  name: string;
  size: string;
}

interface ChatMessageProps {
  message: {
    id: string;
    sender: 'me' | 'them';
    text: string;
    timestamp: string;
    isRead?: boolean;
    attachment?: Attachment;
  };
  avatar?: string; // URL for "them" avatar image
  initials?: string; // Initials for "me" badge, e.g. "SN"
}

function FileAttachment({ attachment }: { attachment: Attachment }) {
  return (
    <div className="flex items-center gap-3 mt-2 bg-[#f5f0ea] rounded-xl px-3 py-2.5 min-w-[220px]">
      {/* File icon */}
      <div className="flex-shrink-0 w-9 h-9 bg-[#e8e0d5] rounded-lg flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a7560" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="8" y1="13" x2="16" y2="13"/>
          <line x1="8" y1="17" x2="12" y2="17"/>
        </svg>
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#232323] truncate">{attachment.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{attachment.size}</p>
      </div>

      {/* Download icon */}
      <button className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>
    </div>
  );
}

function DoubleCheckIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className={className}>
      {/* First check */}
      <path d="M1 5L4.5 8.5L10 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Second check (offset right) */}
      <path d="M5 5L8.5 8.5L14 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function ChatMessage({ message, avatar, initials = 'SN' }: ChatMessageProps) {
  const isMe = message.sender === 'me';

  return (
    <div className={`flex items-end gap-2 mb-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar / Initials badge */}
      {isMe ? (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#CC7000] flex items-center justify-center text-white text-xs font-semibold mb-1">
          {initials}
        </div>
      ) : (
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-200 mb-1">
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs font-semibold">
              ?
            </div>
          )}
        </div>
      )}

      {/* Bubble */}
      <div className={`
        max-w-[75%] px-4 py-3 rounded-2xl shadow-sm
        ${isMe
          ? 'bg-[#CC7000] text-white rounded-br-md'
          : 'bg-white text-[#232323] border border-[#ece7df] rounded-bl-md'
        }
      `}>
        <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>

        {/* Attachment */}
        {message.attachment && (
          <FileAttachment attachment={message.attachment} />
        )}

        {/* Timestamp + read receipt */}
        <div className={`flex items-center gap-1 mt-1.5 text-xs ${isMe ? 'justify-end text-orange-100' : 'text-gray-400'}`}>
          <span>{message.timestamp}</span>
          {isMe && message.isRead && (
            <DoubleCheckIcon className="text-orange-100" />
          )}
        </div>
      </div>
    </div>
  );
}