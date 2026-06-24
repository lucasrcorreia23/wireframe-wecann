"use client";

import { useFlow } from "@/flow/store";
import { Eyebrow } from "@/components/ui";
import { AthenaGlobe } from "@/components/experience/AthenaGlobe";
import { cn } from "@/lib/cn";

// Sugestões contextuais por módulo: frases de prompt que o usuário pode pedir à
// Athena (pills clicáveis). A IA "acompanha" o usuário e muda as sugestões
// conforme o contexto. Coluna DIREITA persistente (presente em toda a plataforma).
const SUGGESTIONS: Record<string, string[]> = {
  home: [
    "Resumir o dia",
    "Quais são meus retornos?",
    "Sugerir conduta",
    "Buscar evidência",
    "Pré-consultas pendentes",
  ],
  messages: [
    "Responder dúvida de posologia",
    "Resumir mensagens novas",
    "Marcar como prioritária",
  ],
  patients: [
    "Resumir a coorte",
    "Sem evolução há 90 dias",
    "Quem está em titulação?",
  ],
  consult: [
    "Resumir a queixa principal",
    "Sugerir CID",
    "Checar interações",
    "Sugerir conduta",
    "Buscar literatura",
  ],
  analise: [
    "Revisar o que a Athena preencheu",
    "Conferir CID e conduta",
    "Quais escalas faltam?",
  ],
};

const PROMPT: Record<string, string> = {
  home: "Pergunte à Athena ou dê instruções…",
  messages: "Peça à Athena para responder ou resumir…",
  patients: "Pergunte à Athena sobre a coorte…",
  consult: "Pergunte à Athena sobre a consulta…",
  analise: "Peça à Athena para revisar a análise…",
};

// Athena — copiloto clínico PERSISTENTE (coluna direita do WorkspaceShell). Monta
// o globo contido UMA vez (não remonta na troca de módulo). Só sugestões/prompt
// trocam com o nó atual. Padrão da pílula: glass-panel-blue + rounded-[28px].
export function AthenaPanel({ className }: { className?: string }) {
  const node = useFlow((s) => s.currentNode);
  const suggestions = SUGGESTIONS[node] ?? [];
  const prompt = PROMPT[node] ?? "Pergunte à Athena…";

  return (
    <aside
      className={cn(
        "glass-panel-blue backdrop-blur-2xl flex h-full min-h-0 flex-col gap-4 rounded-[28px] p-5",
        className,
      )}
    >
      {/* Globo contido + rótulo (o globo fica logo ACIMA da palavra "Athena"). */}
      <div className="flex shrink-0 flex-col items-center gap-1">
        <div className="relative h-40 w-full">
          <AthenaGlobe />
        </div>
        <p className="font-display text-title font-medium text-ink">Athena</p>
        <p className="text-caption text-neutral-600">Copiloto clínico</p>
      </div>

      {/* Sugestões contextuais — pills clicáveis; rolam dentro do painel. */}
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
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

      {/* Input de chat (mock) — padrão rico da Home. */}
      <section className="glass-frost-inner flex shrink-0 flex-col gap-3 rounded-[20px] p-4">
        <input
          type="text"
          placeholder={prompt}
          className="w-full bg-transparent px-1 text-body text-ink placeholder:text-neutral-400 focus:outline-none"
        />
        <div className="flex items-center justify-between gap-2">
          <button className="glass-frost-inner flex items-center gap-2 rounded-full px-3 py-1.5 text-caption text-neutral-700">
            <i className="bx bx-chip text-base text-neutral-500" />
            Núcleo clínico
            <i className="bx bx-chevron-down text-base text-neutral-400" />
          </button>
          <button
            aria-label="Comando de voz"
            className="grid h-9 w-9 place-items-center rounded-full bg-ink text-paper"
          >
            <i className="bx bx-microphone text-lg" />
          </button>
        </div>
      </section>
    </aside>
  );
}
