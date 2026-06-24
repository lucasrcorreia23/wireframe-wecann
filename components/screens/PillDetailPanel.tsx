"use client";

import { WireButton } from "@/components/ui";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ScrollFade } from "@/components/ui/ScrollFade";
import { SlideOverPanel } from "@/components/ui/SlideOverPanel";

export type Pill = {
  tag: string;
  title: string;
  meta: string;
  summary: string;
  keyPoints: string[];
  source: string;
};

// Painel "Pílula do dia" — overlay da Home. Usa o SlideOverPanel (padrão da
// pílula: desliza da direita, GSAP 0.5s power2.out, vidro + rounded-[28px]).
export function PillDetailPanel({
  pill,
  onClose,
}: {
  pill: Pill | null;
  onClose: () => void;
}) {
  return (
    <SlideOverPanel
      open={pill !== null}
      onClose={onClose}
      className="max-w-[1080px]"
      label="Pílula do dia"
      footer={
        <>
          <WireButton variant="ghost" onClick={onClose}>
            Fechar
          </WireButton>
          <WireButton variant="primary" onClick={onClose} className="gap-2">
            <i className="bx bx-check text-lg" />
            Marcar como lida
          </WireButton>
        </>
      }
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

      {/* Conteúdo — vídeo à esquerda, resumo + pontos-chave na lateral. pb p/ rolar
          atrás do CTA fixo. */}
      <ScrollFade className="mt-6 min-h-0 flex-1 pb-24">
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
    </SlideOverPanel>
  );
}
