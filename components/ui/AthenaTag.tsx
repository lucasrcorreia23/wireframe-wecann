import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Marcador de conteúdo preenchido pela IA (Athena) que o médico deve validar.
// Cinza/vidro como o resto do sistema — a "cor" semântica vem do ícone + rótulo,
// nunca de matiz (princípio de design do produto). Espelha o WireBadge.
export function AthenaTag({
  children = "Athena",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/40 px-2 py-0.5 font-mono text-micro uppercase tracking-[0.1em] text-neutral-600",
        className,
      )}
    >
      <Icon name="bot" size={14} className="text-neutral-500" />
      {children}
    </span>
  );
}
