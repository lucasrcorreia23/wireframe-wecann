"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

// Abas wireframe. Estado local (mock); a aba ativa ganha sublinhado tinta.
export function WireTabs({
  tabs,
  className,
}: {
  tabs: string[];
  className?: string;
}) {
  const [active, setActive] = useState(0);
  return (
    <div
      role="tablist"
      className={cn("flex gap-1 border-b border-neutral-200", className)}
    >
      {tabs.map((tab, i) => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === i}
          onClick={() => setActive(i)}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-caption transition-colors duration-[180ms]",
            active === i
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
