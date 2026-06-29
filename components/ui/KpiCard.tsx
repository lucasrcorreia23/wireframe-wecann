import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";
import { Icon } from "./Icon";

// Cartão de KPI — ícone + rótulo + número grande + linha de apoio dinâmica. Usado
// em Agenda / Pré / Pós / Casuística. Monocromático; `accent` (crítico) reservado
// a KPIs realmente críticos (ex.: "Sem confirmação amanhã"). Sem `justify-between`.
export function KpiCard({
  icon,
  label,
  value,
  hint,
  accent = false,
  className,
}: {
  /** Ícone Material Symbols (nome). */
  icon?: string;
  label: string;
  value: React.ReactNode;
  /** Linha de apoio (meta) — pode trazer seu próprio empty ("Tudo em dia"). */
  hint?: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-solid flex min-w-0 flex-1 flex-col gap-2 rounded-[20px] p-4",
        accent && "border-l-2 border-l-critical",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {icon ? <Icon name={icon} size={18} className="text-neutral-500" /> : null}
        <Eyebrow>{label}</Eyebrow>
      </div>
      <div
        className={cn(
          "font-sans text-[28px] font-medium leading-none tabular-nums",
          accent ? "text-critical" : "text-ink",
        )}
      >
        {value}
      </div>
      {hint ? (
        <p className="text-caption leading-snug text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}
