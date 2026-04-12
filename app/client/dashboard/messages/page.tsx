"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ClientSidebar from "@/components/molecules/ClientSidebar";
import MessagesList from "@/components/organisms/MessagesList";
import ChatView from "@/components/organisms/ChatView";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

interface MessageListItem {
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
  sender: "me" | "them";
  text: string;
  timestamp: string;
  isRead?: boolean;
}

type Conversation = {
  id: string;
  jobId: string;
  jobTitle?: string;
  clientId: string;
  clientName?: string;
  freelancerId: string;
  freelancerName?: string;
  canFreelancerMessage?: boolean;
  lastMessage?: {
    text?: string;
    senderId?: string;
    createdAt?: any;
  };
  unread?: Record<string, number>;
};

const formatTimestamp = (value?: any) => {
  const seconds = value?.seconds;
  if (!seconds) return "";
  const date = new Date(seconds * 1000);
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

export default function ClientMessagesPage() {
  const searchParams = useSearchParams();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = firebaseAuth.onAuthStateChanged((user) => {
      if (!user) {
        setConversations([]);
        setChatMessages([]);
        setCurrentUserId(null);
        return;
      }
      setCurrentUserId(user.uid);
      const conversationsQuery = query(
        collection(firebaseDb, "conversations"),
        where("clientId", "==", user.uid)
      );
      const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
        const items = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          return {
            id: docSnap.id,
            jobId: data.jobId ?? "",
            jobTitle: data.jobTitle ?? "",
            clientId: data.clientId ?? "",
            clientName: data.clientName ?? "",
            freelancerId: data.freelancerId ?? "",
            freelancerName: data.freelancerName ?? "",
            canFreelancerMessage: !!data.canFreelancerMessage,
            lastMessage: data.lastMessage ?? {},
            unread: data.unread ?? {},
          } as Conversation;
        });
        setConversations(items);
      });
      return () => unsubscribe();
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const chatFromUrl = searchParams.get("chat");
    if (chatFromUrl) {
      setSelectedChat(chatFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedChat || !currentUserId) {
      setChatMessages([]);
      return;
    }
    const messagesQuery = query(
      collection(firebaseDb, "conversations", selectedChat, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const items: ChatMessage[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          sender: data.senderId === currentUserId ? "me" : "them",
          text: data.text ?? "",
          timestamp: formatTimestamp(data.createdAt) || "Now",
          isRead: true,
        };
      });
      setChatMessages(items);
    });
    return () => unsubscribe();
  }, [selectedChat, currentUserId]);

  useEffect(() => {
    if (!selectedChat || !currentUserId) return;
    updateDoc(doc(firebaseDb, "conversations", selectedChat), {
      [`unread.${currentUserId}`]: 0,
      updatedAt: serverTimestamp(),
    }).catch(() => undefined);
  }, [selectedChat, currentUserId]);

  const messageList = useMemo<MessageListItem[]>(() => {
    if (!currentUserId) return [];
    return conversations.map((conv) => {
      const otherName = conv.freelancerName || "Freelancer";
      const lastText = conv.lastMessage?.text ?? "Start the conversation";
      const lastTime = formatTimestamp(conv.lastMessage?.createdAt) || "";
      const unreadCount = conv.unread?.[currentUserId] ?? 0;
      return {
        id: conv.id,
        sender: {
          name: otherName,
          avatar: "/assets/avatar.png",
          isOnline: true,
        },
        lastMessage: {
          text: lastText,
          timestamp: lastTime,
          isRead: unreadCount === 0,
        },
        unreadCount,
      };
    });
  }, [conversations, currentUserId]);

  const selectedConversation = conversations.find((c) => c.id === selectedChat) ?? null;
  const selectedMessage = selectedConversation
    ? messageList.find((m) => m.id === selectedConversation.id) ?? null
    : null;

  const handleSendMessage = async (text: string) => {
    if (!selectedConversation || !currentUserId) return;
    const otherId = selectedConversation.freelancerId;
    await addDoc(collection(firebaseDb, "conversations", selectedConversation.id, "messages"), {
      senderId: currentUserId,
      senderRole: "client",
      text,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(firebaseDb, "conversations", selectedConversation.id), {
      "lastMessage.text": text,
      "lastMessage.senderId": currentUserId,
      "lastMessage.createdAt": serverTimestamp(),
      [`unread.${currentUserId}`]: 0,
      [`unread.${otherId}`]: increment(1),
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      <div className="flex">
        <ClientSidebar active="/client/dashboard/messages" />

        <div className="flex-1 mt-[50px] lg:ml-0 pt-[55px] md:pt-0">
          <div className="h-screen flex pt-4 md:pt-0">
            <div
              className={`
              w-full md:w-1/3 border-r border-[#e8e6e1]  bg-[#F6F3F1]
              ${selectedChat ? "hidden md:block" : "block"}
              pt-2 md:pt-0
            `}
            >
              <MessagesList
                messages={messageList}
                onSelectChat={setSelectedChat}
                selectedChat={selectedChat}
              />
            </div>

            <div
              className={`
              w-full md:w-2/3 bg-[#F7F6F3]
              ${selectedChat ? "block" : "hidden md:block"}
              pt-2 md:pt-0
            `}
            >
              {selectedMessage ? (
                <ChatView
                  message={selectedMessage}
                  chatMessages={chatMessages}
                  onBack={() => setSelectedChat(null)}
                  onSendMessage={handleSendMessage}
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
