"use client";

import { useFlow, useCanBack } from "@/flow/store";
import { Icon } from "./Icon";
import { cn } from "@/lib/cn";

// Voltar para a tela anterior — vive ao lado do título da tela (não no topo).
// Não-ghost (borda + papel), arredondado; só aparece quando há histórico.
export function BackButton({ className }: { className?: string }) {
  const back = useFlow((s) => s.back);
  const canBack = useCanBack();
  if (!canBack) return null;
  return (
    <button
      onClick={back}
      aria-label="Voltar para a tela anterior"
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neutral-300 bg-paper text-ink transition-colors hover:border-neutral-500",
        className,
      )}
    >
      <Icon name="arrow-back" size={20} />
    </button>
  );
}
