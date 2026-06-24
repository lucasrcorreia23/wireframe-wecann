"use client";

import { useState } from "react";
import { useFlow } from "@/flow/store";
import { cn } from "@/lib/cn";

// Sugestões contextuais por módulo: frases de prompt que o usuário pode pedir à
// Athena (pills clicáveis). A IA "acompanha" o usuário e muda as sugestões
// conforme o contexto.
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
  "clinical-note": [
    "Revisar o que a Athena preencheu",
    "Conferir CID e conduta",
    "Quais escalas faltam?",
  ],
};

// Input de chat (mock) — reutilizado no painel expandido e no mini-balão do orbe
// (PersistentGlobe).
export function ChatInput() {
  const [draft, setDraft] = useState("");
  const hasText = draft.trim().length > 0;
  return (
    <section className="glass-frost-inner flex shrink-0 flex-col gap-3 rounded-[20px] p-3">
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Pergunte o que quiser"
        className="w-full bg-transparent px-1 text-caption text-ink placeholder:text-neutral-400 focus:outline-none"
      />
      <div className="flex items-center justify-between gap-2">
        <button
          aria-label="Anexar arquivo"
          className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/40 hover:text-ink"
        >
          <i className="bx bx-paperclip text-lg" />
        </button>
        <button
          aria-label={hasText ? "Enviar" : "Comando de voz"}
          className="grid h-9 w-9 place-items-center rounded-full bg-ink text-paper"
        >
          <i className={cn("bx text-lg", hasText ? "bx-send" : "bx-microphone")} />
        </button>
      </div>
    </section>
  );
}

// Painel EXPANDIDO da Athena (coluna direita, só fora da Home). O globo NÃO vive
// mais aqui — é o PersistentGlobe, que se encaixa na âncora [data-globe-anchor]
// do topo deste painel. Aqui ficam o rótulo, as sugestões e o chat.
export function AthenaPanel({
  onToggle,
  className,
}: {
  onToggle?: () => void;
  className?: string;
}) {
  const node = useFlow((s) => s.currentNode);
  const suggestions = SUGGESTIONS[node] ?? [];

  return (
    <aside
      className={cn(
        "group relative flex h-full w-full min-h-0 flex-col gap-4 rounded-[28px] bg-white/10 p-3 backdrop-blur-2xl",
        className,
      )}
    >
      {/* Âncora do globo — o PersistentGlobe sobrepõe aqui (topo do painel). */}
      <div data-globe-anchor className="h-20 w-20 shrink-0 self-center" />

      <p className="text-center font-display text-title font-medium text-ink">
        Athena
      </p>

      {/* Sugestões contextuais — pills clicáveis; rolam dentro do painel. */}
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto">
        <div className="flex w-full flex-wrap justify-center gap-2">
          {suggestions.slice(0, 3).map((s) => (
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

      <ChatInput />

      {/* Recolher para o orbe do canto (aparece no hover). */}
      <button
        type="button"
        onClick={() => onToggle?.()}
        aria-label="Recolher Athena"
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-neutral-500 opacity-0 transition hover:bg-white/50 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
      >
        <i className="bx bx-collapse-alt text-lg" />
      </button>
    </aside>
  );
}
