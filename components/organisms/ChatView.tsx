'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from '@/components/molecules/ChatHeader';
import ChatMessage from '@/components/molecules/ChatMessage';
import Button from '@/components/atoms/Button';
import { Send, Paperclip, X } from 'lucide-react';

interface Message {
  id: string;
  sender: {
    name: string;
    avatar: string;
    isOnline: boolean;
    profileUrl?: string;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
}

interface ChatMessageType {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
  isRead?: boolean;
  attachment?: {
    name: string;
    size: string;
    url?: string;
    mimeType?: string;
    resourceType?: string;
  };
}

interface ChatViewProps {
  message: Message;
  chatMessages: ChatMessageType[];
  onBack: () => void;
  onSendMessage?: (text: string, file?: File | null) => void | Promise<void>;
  canSend?: boolean;
}

export default function ChatView({
  message,
  chatMessages,
  onBack,
  onSendMessage,
  canSend = true,
}: ChatViewProps) {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!canSend || isSending) return;
    const text = newMessage.trim();
    if (!text && !selectedFile) return;

    try {
      setIsSending(true);
      if (onSendMessage) {
        await onSendMessage(text, selectedFile);
      }
      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const openFilePicker = () => {
    if (!canSend || isSending) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="h-full flex flex-col bg-[#FCF9F7CC]">
      {/* Header */}
      <ChatHeader sender={message.sender} onBack={onBack} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-1 sm:px-5 py-3 sm:py-6">
        {/* Date separator */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <span className="bg-[#F3F1ED] text-[11px] sm:text-xs text-gray-500 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full font-medium tracking-wide shadow-sm">TODAY</span>
        </div>
        {chatMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} avatar={message.sender.avatar} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-[#e8e6e1] bg-white px-2 sm:px-4 py-2 sm:py-3">
        {selectedFile ? (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-[#EAE7E2] bg-[#F7F6F3] px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-[#1a1a1a]">{selectedFile.name}</p>
              <p className="text-[11px] text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
        />

        <div className="flex items-end gap-1 sm:gap-2">
          {/* Attachment button */}
          <button
            type="button"
            onClick={openFilePicker}
            disabled={!canSend || isSending}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Message input */}
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#F7F6F3] border border-[#ece7df] rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/20 resize-none min-h-[36px] sm:min-h-[44px] max-h-32"
              rows={1}
              disabled={!canSend || isSending}
            />
          </div>

          {/* Send button */}
          <Button
            onClick={() => void handleSendMessage()}
            disabled={(!newMessage.trim() && !selectedFile) || !canSend || isSending}
            className="p-2.5 sm:p-3 bg-[#CC7000] hover:bg-[#A85C00] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Typing indicator - optional */}
        <div className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-gray-400 min-h-[16px] sm:min-h-[18px]">
          {!canSend ? (
            <span>Messaging is locked until the client initiates or accepts the proposal.</span>
          ) : isSending ? (
            <span>Sending...</span>
          ) : message.sender.isOnline ? (
            <span>{message.sender.name} is online</span>
          ) : null}
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center text-[10px] sm:text-[11px] text-gray-400 py-1.5 sm:py-2 tracking-wide bg-[#FCF9F7CC]">
        PAYMENTS ARE SECURED VIA BITLANCE ESCROW
      </div>
    </div>
  );
}
