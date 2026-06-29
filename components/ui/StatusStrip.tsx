import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";
import { Chip } from "./Chip";

// Linha de estados sequenciais (ex.: Pré-anamnese: Respondida / Pendente / Não
// enviada / 1ª consulta). 1 item ativo (inset) + restantes esmaecidos (dim). Label
// à esquerda, chips à direita via spacer `flex-1` (sem `justify-between`).
export type StatusItem = { text: string; active?: boolean };

export function StatusStrip({
  label,
  items,
  className,
}: {
  label?: string;
  items: StatusItem[];
  className?: string;
}) {
  return (
    <div className={cn("flex w-full items-center gap-3", className)}>
      {label ? <Eyebrow className="shrink-0">{label}</Eyebrow> : null}
      {/* Chips preenchem (flex-1) e alinham à direita — sem spacer vazio. */}
      <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
        {items.map((it, i) => (
          <Chip key={i} tone={it.active ? "inset" : "dim"}>
            {it.text}
          </Chip>
        ))}
      </div>
    </div>
  );
}
