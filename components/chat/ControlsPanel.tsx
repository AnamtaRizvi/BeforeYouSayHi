"use client";

import { classNames } from "@/lib/utils";

type Mode = "friendly" | "flirty" | "serious";
type Length = "short" | "medium" | "long";

type ControlsPanelProps = {
  mode: Mode;
  length: Length;
  vibe: number;
  onModeChange: (m: Mode) => void;
  onLengthChange: (l: Length) => void;
  onVibeChange: (v: number) => void;
  className?: string;
};

const MODES: Mode[] = ["friendly", "flirty", "serious"];
const LENGTHS: Length[] = ["short", "medium", "long"];

export function ControlsPanel({
  mode,
  length,
  vibe,
  onModeChange,
  onLengthChange,
  onVibeChange,
  className,
}: ControlsPanelProps) {
  return (
    <div className={classNames("space-y-4", className)}>
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Mode
        </label>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              className={classNames(
                "rounded-full px-3 py-1.5 text-sm font-medium transition",
                mode === m
                  ? "bg-gradient-to-r from-rose-500 to-violet-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Length
        </label>
        <div className="flex flex-wrap gap-2">
          {LENGTHS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onLengthChange(l)}
              className={classNames(
                "rounded-full px-3 py-1.5 text-sm font-medium transition",
                length === l
                  ? "bg-gradient-to-r from-rose-500 to-violet-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 flex justify-between">
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Vibe
          </label>
          <span className="text-sm font-medium text-zinc-700">{vibe}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={vibe}
          onChange={(e) => onVibeChange(Number(e.target.value))}
          className="w-full accent-rose-500"
        />
      </div>
    </div>
  );
}
