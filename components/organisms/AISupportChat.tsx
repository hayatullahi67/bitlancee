"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

type SupportMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AISupportChat({
  buttonLabel = "Start Live Chat",
  intro = "Hi, I can help with the client and freelancer dashboards. Ask me where to find something or how a workflow works.",
  open,
  onOpenChange,
  fullPage = false,
  className,
}: {
  buttonLabel?: string;
  intro?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  fullPage?: boolean;
  className?: string;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>([
    { role: "assistant", content: intro },
  ]);
  const isChatOpen = open ?? internalOpen;

  const setIsChatOpen = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
    if (open === undefined) {
      setInternalOpen(nextOpen);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const nextMessages: SupportMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setErrorMessage("");
    setIsSending(true);

    try {
      const response = await fetch("/api/ai-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "AI support is unavailable right now.");
      }

      setMessages((current) => [...current, { role: "assistant", content: data.reply || "" }]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "AI support is unavailable right now.");
    } finally {
      setIsSending(false);
    }
  };

  if (isChatOpen) {
    return (
      <div
        className={cn(
          "flex overflow-hidden rounded-[14px] border border-[#EAE7E2] bg-white text-[#1a1a1a] shadow-[0_10px_28px_rgba(0,0,0,0.08)]",
          fullPage ? "min-h-[calc(100vh-150px)] flex-col" : "flex-col",
          className
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#EFECE7] px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C4F00]">
              Bitlance AI Support
            </div>
            <div className="mt-1 text-[14px] font-semibold text-[#1a1a1a]">
              Dashboard assistant
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsChatOpen(false)}
            className="rounded-full border border-[#EAE7E2] px-3 py-1 text-[12px] text-[#6b6762] hover:bg-[#F7F4F0]"
          >
            Back
          </button>
        </div>

        <div className={cn("overflow-y-auto bg-[#FCF9F7] px-4 py-4", fullPage ? "min-h-0 flex-1" : "max-h-[420px] min-h-[300px]")}>
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[90%] rounded-[12px] px-4 py-3 text-[12px] leading-[1.65] ${
                  message.role === "user"
                    ? "ml-auto bg-[#1a1a1a] text-white"
                    : "border border-[#EFECE7] bg-white text-[#4d4945]"
                }`}
              >
                {message.content}
              </div>
            ))}
            {isSending ? (
              <div className="max-w-[90%] rounded-[12px] border border-[#EFECE7] bg-white px-4 py-3 text-[12px] text-[#6b6762]">
                Thinking...
              </div>
            ) : null}
          </div>
        </div>

        {errorMessage ? (
          <div className="border-t border-[#F8D4C4] bg-[#FFF6F2] px-4 py-3 text-[12px] text-[#8C4F00]">
            {errorMessage}
          </div>
        ) : null}

        <div className="border-t border-[#EFECE7] bg-white p-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask about jobs, escrow, contracts..."
              className="min-w-0 flex-1 rounded-full border border-[#EAE7E2] px-4 py-2 text-[12px] text-black focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <Button size="sm" className="rounded-full" onClick={sendMessage} disabled={isSending || !input.trim()}>
              Send
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button size="sm" className="rounded-full" onClick={() => setIsChatOpen(true)}>
        {buttonLabel}
      </Button>
  );
}
