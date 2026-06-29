"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/cn";

// Card de vidro colapsável (padrão da pílula: glass-panel-blue + rounded-[28px]).
// O colapso anima a ALTURA via grid-template-rows 1fr↔0fr (CSS puro) — sem
// transform em ancestral, então o backdrop-filter do vidro sobrevive.
export function CollapsibleCard({
  icon,
  title,
  subtitle,
  headerExtra,
  defaultOpen = true,
  children,
  className,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  /** Controles à direita do header (ex.: segmented + dropdown de template). */
  headerExtra?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={cn(
        "glass-panel-blue backdrop-blur-2xl flex flex-col rounded-[28px] p-6",
        className,
      )}
    >
      <header className="flex flex-wrap items-center gap-3">
        {icon ? (
          <span className="glass-frost-inner grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink">
            <Icon name={icon} size={20} />
          </span>
        ) : null}
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="font-display text-title font-medium text-ink">{title}</h3>
          {subtitle ? (
            <p className="truncate text-caption text-neutral-500">{subtitle}</p>
          ) : null}
        </div>
        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
          {headerExtra}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Recolher" : "Expandir"}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/40 hover:text-ink"
          >
            <Icon name="chevron-up" size={24} className={cn("transition-transform duration-300", !open && "rotate-180")} />
          </button>
        </div>
      </header>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-5">{children}</div>
        </div>
      </div>
    </section>
  );
}
