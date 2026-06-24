"use client";

import { useFlow } from "@/flow/store";
import { Eyebrow } from "@/components/ui";
import { cn } from "@/lib/cn";

// Sugestões contextuais por tela (Mapa Funcional): frases de prompt clicáveis.
// A IA muda de "funcionalidades" conforme a etapa da jornada.
const SUGGESTIONS: Record<string, string[]> = {
  "pre-review": [
    "Resumir o paciente",
    "O que falta na pré-consulta?",
    "Pontos de atenção",
    "Checar alergias",
  ],
  consult: [
    "Resumir a queixa",
    "Sugerir CID",
    "Checar interações",
    "Sugerir conduta",
  ],
  report: [
    "Resumir os desfechos",
    "Gerar laudo",
    "Evolução em 6 meses",
  ],
  casuistry: [
    "Resumir a coorte",
    "Casos elegíveis (LGPD)",
    "Exportar casuística",
  ],
};

const PROMPT: Record<string, string> = {
  "pre-review": "Pergunte à Athena sobre o paciente…",
  consult: "Pergunte à Athena sobre a consulta…",
  report: "Pergunte à Athena sobre o relatório…",
  casuistry: "Pergunte à Athena sobre a casuística…",
};

// Companheiro de IA docado à direita: slot do globo (o globo 3D billboarda
// atrás), sugestões contextuais e um chat (mock). Presente na jornada não-Home.
export function AIDock({ className }: { className?: string }) {
  const node = useFlow((s) => s.currentNode);
  const suggestions = SUGGESTIONS[node] ?? [];
  const prompt = PROMPT[node] ?? "Pergunte à Athena…";

  return (
    <aside
      className={cn(
        "glass-panel-blue backdrop-blur-2xl flex flex-col gap-4 rounded-[28px] p-5",
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

      {/* Sugestões contextuais por tela — pills clicáveis. Fluem na superfície de
          scroll única (sem scroll interno próprio — tudo rola junto). */}
      <div className="flex flex-col gap-2">
        <Eyebrow>Sugestões</Eyebrow>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="glass-frost-inner flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption text-neutral-700 transition-colors hover:text-ink"
            >
              <i className="bx bx-message-square-dots text-base text-neutral-500" />
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chat (mock). */}
      <div className="glass-frost-inner flex items-center gap-2 rounded-full py-2 pl-4 pr-2">
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
