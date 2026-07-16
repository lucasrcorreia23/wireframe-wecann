"use client";

import { WireButton } from "@/components/ui";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ScrollFade } from "@/components/ui/ScrollFade";
import { cn } from "@/lib/cn";

export type Pill = {
  tag: string;
  title: string;
  meta: string;
  summary: string;
  keyPoints: string[];
  source: string;
};

// Painel "Pílula do dia" — overlay local da Home (wireframe). Espelha a casca do
// NewAppointmentPanel: é o próprio vidro (backdrop-filter próprio), entra pela
// direita enquanto os módulos da Home recuam. Animação fica no HomeScreen via a
// classe .pill-detail-panel.
export function PillDetailPanel({
  pill,
  onClose,
}: {
  pill: Pill | null;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "pill-detail-panel glass-panel-blue backdrop-blur-2xl absolute inset-y-0 right-0 my-auto flex h-fit max-h-full w-full max-w-[1080px] flex-col rounded-[28px] p-7 opacity-0",
        pill ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!pill}
    >
      {/* Header */}
      <header className="flex items-start gap-3">
        <span className="glass-frost-inner grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink">
          <i className="bx bx-capsule text-xl" />
        </span>
        <div className="flex min-w-0 flex-col gap-1.5">
          <Eyebrow>
            {pill?.tag} · {pill?.meta} de leitura
          </Eyebrow>
          <h2 className="font-display text-title font-medium text-ink text-pretty">
            {pill?.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-white/40 hover:text-ink"
        >
          <i className="bx bx-x text-2xl" />
        </button>
      </header>

      {/* Conteúdo — vídeo à esquerda, resumo + pontos-chave na lateral. */}
      <ScrollFade className="mt-6 min-h-0 flex-1">
        <div className="grid grid-cols-[1.3fr_1fr] items-start gap-7">
          {/* Esquerda — vídeo. */}
          <div className="glass-frost-inner grid aspect-[16/9] w-full place-items-center rounded-2xl">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-ink text-paper">
              <i className="bx bx-play text-3xl" />
            </span>
          </div>

          {/* Lateral — resumo + pontos-chave. */}
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-2">
              <Eyebrow>Sobre o assunto</Eyebrow>
              <p className="text-body text-pretty text-neutral-700">
                {pill?.summary}
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <Eyebrow>Pontos-chave</Eyebrow>
              <ul className="flex flex-col gap-2.5">
                {pill?.keyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <i className="bx bx-check mt-0.5 shrink-0 text-lg text-ink" />
                    <span className="text-body text-pretty text-neutral-700">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </ScrollFade>

      {/* Footer */}
      <footer className="mt-6 flex items-center justify-end gap-3 border-t border-white/50 pt-5">
        <WireButton variant="ghost" onClick={onClose}>
          Fechar
        </WireButton>
        <WireButton variant="primary" onClick={onClose} className="gap-2">
          <i className="bx bx-check text-lg" />
          Marcar como lida
        </WireButton>
      </footer>
    </div>
  );
}
