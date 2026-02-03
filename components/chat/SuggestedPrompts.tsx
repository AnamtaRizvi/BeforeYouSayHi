"use client";

type SuggestedPromptsProps = {
  prompts: string[];
  onSelect: (text: string) => void;
  className?: string;
};

export function SuggestedPrompts({ prompts, onSelect, className }: SuggestedPromptsProps) {
  if (prompts.length === 0) return null;
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Suggested
      </p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((text, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(text)}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
