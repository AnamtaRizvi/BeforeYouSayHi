"use client";

import { useRef, useEffect } from "react";
import { ChatBubble } from "./ChatBubble";
import { TypingDots } from "./TypingDots";

export type ChatMessage = { role: "user" | "assistant"; content: string };

type ChatWindowProps = {
  messages: ChatMessage[];
  loading?: boolean;
  suggestedPrompts?: React.ReactNode;
  input: React.ReactNode;
  className?: string;
};

export function ChatWindow({
  messages,
  loading,
  suggestedPrompts,
  input,
  className,
}: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${className ?? ""}`}>
      <div className="flex-1 overflow-y-auto space-y-3 pb-4 min-h-0">
        {messages.length === 0 && suggestedPrompts}
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} content={m.content} />
        ))}
        {loading && <TypingDots />}
        <div ref={endRef} />
      </div>
      {input}
    </div>
  );
}
