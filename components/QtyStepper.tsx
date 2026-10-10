"use client";

import { Minus, Plus } from "lucide-react";

type Props = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label: string;
  increaseLabel: string;
  decreaseLabel: string;
};

export function QtyStepper({ value, min = 1, max = 10, onChange, label, increaseLabel, decreaseLabel }: Props) {
  const button = "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-panel disabled:opacity-40";
  return (
    <div role="group" aria-label={label} className="inline-flex items-center gap-1 rounded-full border border-line p-0.5">
      <button type="button" className={button} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={decreaseLabel}>
        <Minus size={14} aria-hidden />
      </button>
      <output aria-live="polite" className="w-6 text-center text-sm font-semibold tabular-nums">
        {value}
      </output>
      <button type="button" className={button} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={increaseLabel}>
        <Plus size={14} aria-hidden />
      </button>
    </div>
  );
}
