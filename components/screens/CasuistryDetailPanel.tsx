"use client";

import { WireButton } from "@/components/ui";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ScrollFade } from "@/components/ui/ScrollFade";
import { SlideOverPanel } from "@/components/ui/SlideOverPanel";
import { cn } from "@/lib/cn";

export type CasuistryDetail = {
  kind: "cid" | "treatment";
  /** Código CID (diagnóstico) ou classe/ATC (tratamento). */
  code: string;
  title: string;
  meta: string;
  summary: string;
  points: string[];
};

// Painel de detalhe da Casuística — overlay local sobre o JourneyShell. É o próprio
// vidro (backdrop-filter próprio) e desliza pela direita via transição CSS (transform
// no PRÓPRIO painel é seguro p/ o blur; só transform em ANCESTRAL mataria o vidro dos
// filhos). Acionado ao clicar numa linha das tabelas de CIDs/tratamentos.
export function CasuistryDetailPanel({
  detail,
  onClose,
}: {
  detail: CasuistryDetail | null;
  onClose: () => void;
}) {
  const open = detail !== null;
  return (
    <SlideOverPanel
      open={open}
      onClose={onClose}
      className="max-w-[860px]"
      label="Detalhe da casuística"
      footer={
        <>
          <WireButton variant="ghost" onClick={onClose}>
            Fechar
          </WireButton>
          <WireButton variant="primary" onClick={onClose} className="gap-2">
            <i className="bx bx-bar-chart-alt-2 text-lg" />
            Ver coorte
          </WireButton>
        </>
      }
    >
        <header className="flex items-start gap-3">
          <span className="glass-frost-inner grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink">
            <i
              className={cn(
                "bx text-xl",
                detail?.kind === "treatment" ? "bx-capsule" : "bx-pulse",
              )}
            />
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <Eyebrow>
              {detail?.kind === "treatment" ? "Tratamento" : "Diagnóstico"} ·{" "}
              {detail?.code}
            </Eyebrow>
            <h2 className="font-display text-title font-medium text-ink text-pretty">
              {detail?.title}
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

        <ScrollFade className="mt-6 min-h-0 flex-1 pb-24" watch={detail?.title}>
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-2">
              <Eyebrow>Na sua coorte</Eyebrow>
              <p className="text-body text-pretty text-neutral-700">
                {detail?.summary}
              </p>
              <p className="font-mono text-caption text-neutral-500">
                {detail?.meta}
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <Eyebrow>Pontos-chave</Eyebrow>
              <ul className="flex flex-col gap-2.5">
                {detail?.points.map((point) => (
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
        </ScrollFade>
    </SlideOverPanel>
  );
}
