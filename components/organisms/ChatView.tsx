'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from '@/components/molecules/ChatHeader';
import ChatMessage from '@/components/molecules/ChatMessage';
import Button from '@/components/atoms/Button';
import { Send, Paperclip } from 'lucide-react';

interface Message {
  id: string;
  sender: {
    name: string;
    avatar: string;
    isOnline: boolean;
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
}

interface ChatViewProps {
  message: Message;
  chatMessages: ChatMessageType[];
  onBack: () => void;
}

export default function ChatView({ message, chatMessages, onBack }: ChatViewProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the backend
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#FCF9F7CC]">
      {/* Header */}
      <ChatHeader sender={message.sender} onBack={onBack} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-0 sm:px-5 py-6">
        {/* Date separator */}
        <div className="flex justify-center mb-6">
          <span className="bg-[#F3F1ED] text-xs text-gray-500 px-4 py-1 rounded-full font-medium tracking-wide shadow-sm">TODAY, OCT 24</span>
        </div>
        {chatMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-[#e8e6e1] bg-white px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Message input */}
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 bg-[#F7F6F3] border border-[#ece7df] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/20 resize-none min-h-[44px] max-h-32"
              rows={1}
            />
          </div>

          {/* Send button */}
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-[#CC7000] hover:bg-[#A85C00] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Typing indicator - optional */}
        <div className="mt-2 text-xs text-gray-400 min-h-[18px]">
          {message.sender.isOnline && (
            <span>{message.sender.name} is online</span>
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center text-[11px] text-gray-400 py-2 tracking-wide bg-[#FCF9F7CC]">
        PAYMENTS ARE SECURED VIA BITLANCE ESCROW
      </div>
    </div>
  );
}