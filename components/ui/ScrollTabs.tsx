"use client";

import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Barra de abas horizontal COMPACTA com scroll horizontal (no-scrollbar) — para
// muitas seções num espaço estreito. A ativa ganha vidro "paper" + sombra sutil;
// as demais ficam sutis. Sem cor (peso de cinza), no padrão do Segmented/pílula.
// Controlada por chave (genérica no tipo).
export function ScrollTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { key: T; label: string; icon?: string }[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      // -m-1 p-1: overflow-x-auto também recorta no eixo Y; o padding (com margem
      // negativa p/ não mexer no layout) dá folga em cima/embaixo para a sombra e o
      // arredondado das pílulas não serem cortados.
      className={cn(
        "no-scrollbar -m-1 flex items-center gap-1 overflow-x-auto p-1",
        className,
      )}
    >
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.key)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-caption transition-colors duration-[180ms]",
              active
                ? "bg-paper font-medium text-ink shadow-sm"
                : "text-neutral-500 hover:bg-white/40 hover:text-neutral-700",
            )}
          >
            {o.icon ? <Icon name={o.icon} className="text-base" /> : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
