"use client";

import { classNames } from "@/lib/utils";

type ChatBubbleProps = {
  role: "user" | "assistant";
  content: string;
  className?: string;
};

export function ChatBubble({ role, content, className }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div
      className={classNames(
        "flex",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={classNames(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "rounded-br-md bg-gradient-to-r from-rose-500 to-violet-500 text-white"
            : "rounded-bl-md bg-white border border-zinc-200 text-zinc-800 shadow-sm"
        )}
      >
        {content}
      </div>
    </div>
  );
}
