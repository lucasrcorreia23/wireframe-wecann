"use client";

import { useFlow } from "@/flow/store";
import { Eyebrow } from "@/components/ui";
import { cn } from "@/lib/cn";

type Insight = { tag: string; text: string };

// Insights contextuais por tela (Mapa Funcional). A IA muda de "funcionalidades"
// conforme a etapa da jornada.
const INSIGHTS: Record<string, Insight[]> = {
  "pre-review": [
    { tag: "Atenção", text: "Alergia a dipirona — evitar combinações." },
    { tag: "Pauta", text: "Focar em sono e desmame de opioide." },
    { tag: "Pré-consulta", text: "40% preenchida — faltam escalas de dor." },
  ],
  consult: [
    { tag: "Pergunta-chave", text: "Investigar qualidade do sono." },
    { tag: "Alerta", text: "Interação: tramadol + amitriptilina." },
    { tag: "CID sugerido", text: "M79.7 · fibromialgia." },
  ],
  report: [
    { tag: "Outcome", text: "Dor (BPI) caiu 32% em 6 meses." },
    { tag: "Evolução", text: "Sono (PSQI) estável; ansiedade ↓." },
    { tag: "Pesquisa", text: "Caso elegível p/ coorte (LGPD)." },
  ],
};

const PROMPT: Record<string, string> = {
  "pre-review": "Pergunte à Athena sobre o paciente…",
  consult: "Pergunte à Athena sobre a consulta…",
  report: "Pergunte à Athena sobre o relatório…",
};

// Companheiro de IA docado à direita: slot do globo (o globo 3D billboarda
// atrás), insights contextuais e um chat (mock). Presente na jornada não-Home.
export function AIDock({ className }: { className?: string }) {
  const node = useFlow((s) => s.currentNode);
  const insights = INSIGHTS[node] ?? [];
  const prompt = PROMPT[node] ?? "Pergunte à Athena…";

  return (
    <aside
      className={cn(
        "glass-panel-blue flex min-h-0 flex-col gap-4 rounded-[28px] p-5",
        className,
      )}
    >
      {/* Slot do globo — área transparente onde o globo 3D aparece (billboard). */}
      <div className="relative h-44 shrink-0">
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <p className="font-display text-title font-medium text-ink">Athena</p>
          <p className="text-caption text-neutral-600">Copiloto clínico</p>
        </div>
      </div>

      {/* Insights contextuais por tela. */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto no-scrollbar">
        <Eyebrow>Insights</Eyebrow>
        <ul className="flex flex-col gap-2">
          {insights.map((it) => (
            <li
              key={it.tag}
              className="glass-frost-inner flex flex-col gap-1 rounded-2xl px-3 py-2.5"
            >
              <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
                {it.tag}
              </span>
              <span className="text-caption text-neutral-700">{it.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat (mock). */}
      <div className="glass-frost-inner mt-auto flex items-center gap-2 rounded-full py-2 pl-4 pr-2">
        <span className="flex-1 truncate text-caption text-neutral-400">
          {prompt}
        </span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-paper">
          →
        </span>
      </div>
    </aside>
  );
}
