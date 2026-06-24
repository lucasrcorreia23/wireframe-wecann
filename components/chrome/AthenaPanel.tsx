"use client";

import { useFlow } from "@/flow/store";
import { Eyebrow } from "@/components/ui";
import { AthenaGlobe } from "@/components/experience/AthenaGlobe";
import { cn } from "@/lib/cn";

type Insight = { tag: string; text: string };

// Insights contextuais por módulo: a IA "acompanha" o usuário e muda de pauta
// conforme o contexto. Coluna DIREITA persistente (presente em toda a plataforma).
const INSIGHTS: Record<string, Insight[]> = {
  home: [
    { tag: "Pauta do dia", text: "2 pré-consultas aguardando revisão." },
    { tag: "Atenção", text: "Renovação de receita controlada vence hoje." },
    { tag: "Resumo", text: "7 compromissos · 3 retornos · 1 primeira vez." },
  ],
  messages: [
    { tag: "Triagem", text: "2 mensagens novas marcadas como prioritárias." },
    { tag: "Sugestão", text: "Resposta-modelo pronta p/ dúvida de posologia." },
  ],
  patients: [
    { tag: "Coorte", text: "128 pacientes ativos · 18 em titulação." },
    { tag: "Acompanhamento", text: "5 sem evolução registrada há 90 dias." },
  ],
  consult: [
    { tag: "Pergunta-chave", text: "Investigar qualidade do sono e despertares." },
    { tag: "Alerta", text: "Interação: tramadol + amitriptilina (serotoninérgica)." },
    { tag: "CID sugerido", text: "M79.7 · fibromialgia." },
    { tag: "Literatura", text: "Canabinoide adjuvante reduz dor noturna (coorte 2023)." },
  ],
  analise: [
    { tag: "A validar", text: "Queixa principal e HDA preenchidas pela Athena." },
    { tag: "Conferir", text: "CID e conduta sugeridos aguardam confirmação." },
    { tag: "Escalas", text: "Faltam 2 escalas para fechar a evolução." },
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
// o globo contido UMA vez (não remonta na troca de módulo). Só insights/prompt
// trocam com o nó atual. Padrão da pílula: glass-panel-blue + rounded-[28px].
export function AthenaPanel({ className }: { className?: string }) {
  const node = useFlow((s) => s.currentNode);
  const insights = INSIGHTS[node] ?? [];
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

      {/* Insights contextuais — rolam dentro do painel. */}
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
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
