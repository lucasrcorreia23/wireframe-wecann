import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";

// Faixa-resumo de N colunas (ex.: Diagnóstico · Comorbidades · Tratamento ·
// Alergias). Cada coluna: label micro-uppercase + linha de chips. Colunas com
// `flex-1` + gap; hairline inferior opcional por coluna (como no Figma, onde só as
// duas primeiras têm a linha). Sem `justify-between`.
export type SummaryColumn = {
  label: string;
  children: React.ReactNode;
  /** Hairline inferior (subtle), como nas 1ªs colunas do Figma. */
  divider?: boolean;
};

export function SummaryStrip({
  columns,
  className,
}: {
  columns: SummaryColumn[];
  className?: string;
}) {
  return (
    <div className={cn("flex w-full items-start gap-6", className)}>
      {columns.map((c, i) => (
        <div
          key={i}
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-3",
            c.divider && "border-b-[0.8px] border-white/50 pb-3",
          )}
        >
          <Eyebrow>{c.label}</Eyebrow>
          <div className="flex flex-wrap items-center gap-2">{c.children}</div>
        </div>
      ))}
    </div>
  );
}
