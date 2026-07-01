import { cn } from "@/lib/cn";

// Cabeçalho padrão das telas de conteúdo — título display (Inter) + subtítulo +
// ações à direita (via spacer `flex-1`, sem `justify-between`). Mantém as 6 telas
// consistentes com o look do Figma.
export function ScreenHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end gap-6", className)}>
      {/* Conteúdo preenche (flex-1) e empurra as ações p/ a ponta — sem spacer vazio. */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1 className="font-display text-title font-medium text-ink">{title}</h1>
        {subtitle ? (
          <p className="text-caption text-neutral-600 text-pretty">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
