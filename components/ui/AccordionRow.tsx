"use client";

import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Linha em "sanfona" do Figma: aba branca à ESQUERDA (180px, cantos arredondados
// só à esquerda) encostando (mr-[-8px], z acima) num corpo #f9f9f9 arredondado.
// O corpo mostra um `summary` inline (chips/listas) + chevron; clicar alterna e
// revela `children` abaixo, dentro do mesmo corpo. Sem `justify-between`: usamos
// spacer `flex-1` (cópia limpa p/ Figma).
export function AccordionRow({
  icon,
  title,
  summary,
  children,
  open = false,
  onToggle,
  className,
}: {
  /** Ícone Material Symbols (nome) da aba. */
  icon: string;
  title: string;
  /** Conteúdo inline na barra (chips, contagens) — visível sempre. */
  summary?: React.ReactNode;
  /** Detalhe revelado quando aberto. */
  children?: React.ReactNode;
  open?: boolean;
  onToggle?: () => void;
  className?: string;
}) {
  const expandable = Boolean(children);
  return (
    <div className={cn("flex w-full items-start", className)}>
      {/* Aba (handle) — branca, cantos à esquerda, sobreposta ao corpo. */}
      <div className="relative z-[1] mr-[-8px] flex w-[180px] shrink-0 items-center gap-2 rounded-l-[24px] bg-paper p-4 text-ink">
        <Icon name={icon} size={18} className="text-neutral-700" />
        <span className="font-sans text-body font-medium leading-tight">
          {title}
        </span>
      </div>

      {/* Corpo — #f9f9f9 arredondado; summary + chevron, e detalhe quando aberto. */}
      <div className="min-w-0 flex-1 rounded-[20px] bg-[#f9f9f9]">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          disabled={!expandable}
          className={cn(
            "flex w-full items-center gap-3 p-4 text-left",
            expandable ? "cursor-pointer" : "cursor-default",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {summary}
          </div>
          {expandable ? (
            <Icon
              name="chevron-down"
              size={22}
              className={cn(
                "text-neutral-500 transition-transform duration-[180ms]",
                open && "rotate-180",
              )}
            />
          ) : null}
        </button>

        {expandable && open ? (
          <div className="border-t border-neutral-200/70 px-4 pb-4 pt-3">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
