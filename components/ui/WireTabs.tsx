"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

// Abas wireframe. A aba ativa ganha sublinhado tinta. Pode ser usada CONTROLADA
// (props `active` + `onChange`, para trocar o conteúdo da tela) ou não-controlada
// (estado local, só visual).
export function WireTabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: string[];
  /** Índice da aba ativa (modo controlado). Omitido → estado local. */
  active?: number;
  onChange?: (index: number) => void;
  className?: string;
}) {
  const [internal, setInternal] = useState(0);
  const current = active ?? internal;
  const select = (i: number) => {
    setInternal(i);
    onChange?.(i);
  };
  return (
    <div
      role="tablist"
      className={cn("flex gap-1 border-b border-neutral-200", className)}
    >
      {tabs.map((tab, i) => (
        <button
          key={tab}
          role="tab"
          aria-selected={current === i}
          onClick={() => select(i)}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-caption transition-colors duration-[180ms]",
            current === i
              ? "border-ink font-medium text-ink"
              : "border-transparent text-neutral-500 hover:text-neutral-700",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
