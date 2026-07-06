"use client";

import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Ícone de info com tooltip no hover/foco. Balão escuro (ink) acima do ícone,
// centralizado, com seta; segue a tipografia text-micro do wireframe. Sem lib
// externa: CSS puro via group-hover (os contêineres da sanfona não clipam).
export function InfoTip({
  text,
  className,
}: {
  /** Explicação exibida no balão. */
  text: string;
  className?: string;
}) {
  return (
    <span
      tabIndex={0}
      aria-label={text}
      className={cn(
        "group/tip relative inline-flex cursor-help items-center outline-none",
        className,
      )}
    >
      <Icon
        name="info"
        size={14}
        className="text-neutral-400 transition-colors group-hover/tip:text-neutral-600 group-focus-visible/tip:text-neutral-600"
      />
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-60 -translate-x-1/2",
          "rounded-xl bg-ink px-3 py-2 text-micro font-normal normal-case tracking-normal text-paper",
          "shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
          "opacity-0 transition-opacity duration-150",
          "group-hover/tip:opacity-100 group-focus-visible/tip:opacity-100",
        )}
      >
        {text}
        {/* Seta — quadradinho rotacionado colado à base do balão. */}
        <span
          aria-hidden
          className="absolute left-1/2 top-full -mt-[5px] size-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-ink"
        />
      </span>
    </span>
  );
}
