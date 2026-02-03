"use client";

export function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-1 rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <span
          className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "0.6s" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"
          style={{ animationDelay: "150ms", animationDuration: "0.6s" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"
          style={{ animationDelay: "300ms", animationDuration: "0.6s" }}
        />
      </div>
    </div>
  );
}
