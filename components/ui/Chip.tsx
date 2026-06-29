import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Chip/pílula — a forma exata do Figma (Inter 14px, hairline 0.8px, rounded-full).
// Gravidade por PESO de cinza; "critical" é o único acento (uso restrito a sinais
// clinicamente críticos). `inset` = chip "ativo" levemente preenchido; `dim` =
// estado inativo/futuro (opacidade reduzida).
export type ChipTone = "default" | "muted" | "inset" | "dim" | "critical";

const TONE: Record<ChipTone, string> = {
  default: "bg-paper border-neutral-200 text-ink",
  muted: "bg-paper border-neutral-200 text-neutral-600",
  inset: "bg-neutral-100 border-neutral-300 text-neutral-700",
  dim: "bg-paper border-neutral-200 text-neutral-500 opacity-45",
  critical: "bg-critical-weak border-critical/40 text-critical",
};

export function Chip({
  children,
  tone = "default",
  icon,
  className,
}: {
  children: React.ReactNode;
  tone?: ChipTone;
  /** Ícone Material Symbols (nome/ligadura) à esquerda. */
  icon?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-[0.8px]",
        "px-[9px] py-[5px] font-sans text-caption leading-none",
        TONE[tone],
        className,
      )}
    >
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </span>
  );
}
