'use client';

import React, { useState } from 'react';
import FreelancerSidebar from '@/components/molecules/FreelancerSidebar';
import MessagesList from '@/components/organisms/MessagesList';
import ChatView from '@/components/organisms/ChatView';

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

interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
  isRead?: boolean;
}

// Mock data
const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    sender: {
      name: 'Lightning Labs Inc.',
      avatar: '/assets/avatar.png',
      isOnline: true,
    },
    lastMessage: {
      text: 'Thanks for your proposal! We\'d like to discuss the project details.',
      timestamp: '2 min ago',
      isRead: false,
    },
    unreadCount: 2,
  },
  {
    id: '2',
    sender: {
      name: 'Bitcoin Core Team',
      avatar: '/assets/avatar.png',
      isOnline: false,
    },
    lastMessage: {
      text: 'Your Rust implementation looks promising. Let\'s schedule a call.',
      timestamp: '1 hour ago',
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: '3',
    sender: {
      name: 'Blockstream',
      avatar: '/assets/avatar.png',
      isOnline: true,
    },
    lastMessage: {
      text: 'Hi! We have an interesting project that matches your skills.',
      timestamp: '3 hours ago',
      isRead: false,
    },
    unreadCount: 1,
  },
];

const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'them',
    text: 'Hi! Thanks for applying to our Senior Rust Engineer position.',
    timestamp: '10:30 AM',
    isRead: true,
  },
  {
    id: '2',
    sender: 'me',
    text: 'Thank you! I\'m very excited about this opportunity. I have extensive experience with Rust and Lightning Network protocols.',
    timestamp: '10:32 AM',
    isRead: true,
  },
  {
    id: '3',
    sender: 'them',
    text: 'Great! We\'d like to discuss the project timeline and your availability. Are you available for a quick call this week?',
    timestamp: '10:35 AM',
    isRead: true,
  },
  {
    id: '4',
    sender: 'me',
    text: 'Absolutely! I\'m available Tuesday or Wednesday afternoon. What time works best for you?',
    timestamp: '10:37 AM',
    isRead: false,
  },
];

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages] = useState(MOCK_MESSAGES);
  const [chatMessages] = useState(MOCK_CHAT_MESSAGES);

  const selectedMessage = messages.find(m => m.id === selectedChat);

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      <div className="flex">
        {/* Sidebar */}
        <FreelancerSidebar active="/freelancer/dashboard/messages" />

        {/* Main Content */}
        <div className="flex-1 mt-[50px] lg:ml-0">
          <div className="h-screen flex pt-4 md:pt-0"> {/* Add pt-4 for mobile to avoid overlay */}
            {/* Messages List - Hidden on mobile/tablet when chat is selected */}
            <div className={`
              w-full md:w-1/3 border-r border-[#e8e6e1]  bg-[#F6F3F1]
              ${selectedChat ? 'hidden md:block' : 'block'}
              pt-2 md:pt-0
            `}>
              <MessagesList
                messages={messages}
                onSelectChat={setSelectedChat}
                selectedChat={selectedChat}
              />
            </div>

            {/* Chat View - Hidden on mobile/tablet when list is shown */}
            <div className={`
              w-full md:w-2/3 bg-[#F7F6F3]
              ${selectedChat ? 'block' : 'hidden md:block'}
              pt-2 md:pt-0
            `}>
              {selectedMessage ? (
                <ChatView
                  message={selectedMessage}
                  chatMessages={chatMessages}
                  onBack={() => setSelectedChat(null)}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}