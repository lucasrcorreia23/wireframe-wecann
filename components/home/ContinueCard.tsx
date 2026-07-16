"use client";

import { cn } from "@/lib/cn";
import { FOLLOW_UPS } from "./chatData";

// Card "Continue com mais perguntas" (Figma 0-459/0-514): rounded-16, borda
// #f2f2f1, p-24, header (ícone sweep + serif 20 + chevron), divisor e 3
// sugestões (Inter Medium 14 #676867) com chevron-right — clicar dispara uma
// NOVA pergunta (substitui a Q&A atual).
export function ContinueCard({
  className,
  onSelect,
}: {
  className?: string;
  onSelect: (question: string) => void;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-[16px] border border-neutral-100 bg-white p-6",
        className,
      )}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/figma/icon-sweep.svg" alt="" className="size-6" />
          <h3 className="font-display text-[20px] font-semibold leading-[1.4] text-ink">
            Continue com mais perguntas
          </h3>
        </div>
        <img
          src="/figma/icon-chevron-soft.svg"
          alt=""
          className="size-6 -rotate-90"
        />
      </header>
      <div aria-hidden className="h-px w-full bg-border-default" />
      <ul className="flex flex-col gap-4">
        {FOLLOW_UPS.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => onSelect(q)}
              className="group flex w-full items-center gap-2 text-left"
            >
              <span className="min-w-0 flex-1 text-[14px] font-medium leading-[1.4] text-secondary transition-colors group-hover:text-ink">
                {q}
              </span>
              <img
                src="/figma/icon-chevron-right.svg"
                alt=""
                className="size-6 shrink-0"
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
