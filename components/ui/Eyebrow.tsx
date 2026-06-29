import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Eyebrow/label: mono, uppercase, tracking largo (§2.2). Usado acima de títulos
// e como rótulo de seção/funcionalidade. `icon` exibe um boxicon sutil à esquerda
// (mesmo tamanho/cor da Home) — fonte única do padrão ícone-no-título.
export function Eyebrow({
  children,
  icon,
  className,
}: {
  children: React.ReactNode;
  /** Ícone boxicon sutil ao lado do label (ex.: "bx-calendar"). */
  icon?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-micro uppercase tracking-[0.14em] text-neutral-500",
        className,
      )}
    >
      {icon ? <Icon name={icon} size={15} className="text-neutral-400" /> : null}
      {children}
    </span>
  );
}
