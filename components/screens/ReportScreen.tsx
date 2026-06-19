"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import {
  ScreenShell,
  WireCard,
  WireButton,
  WireBadge,
  Eyebrow,
} from "@/components/ui";

// `report` — Relatório final · TERMINUS. Compila a jornada, pré-visualiza e
// entrega ao paciente/cliente. O estado de sucesso é um momento editorial.
export function ReportScreen() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return <ReportSent onReset={() => setSent(false)} />;
  }

  return (
    <ScreenShell
      zone="Pós-consulta · terminus"
      title="Relatório final"
      lead="Compilação dos documentos da jornada — laudos, conduta e evolução."
      actions={
        <WireButton variant="primary" onClick={() => setSent(true)}>
          Enviar ao paciente / cliente
        </WireButton>
      }
    >
      <div className="grid grid-cols-5 gap-6">
        <WireCard
          className="col-span-2"
          eyebrow="Compilação"
          title="Documentos da jornada"
        >
          <ul className="flex flex-col divide-y divide-neutral-200">
            {[
              ["Laudo médico", "Emitido"],
              ["Conduta e prescrição", "Controle especial"],
              ["Evolução longitudinal", "12 meses"],
              ["Escalas (PROMs)", "BPI · PSQI · GAD-7"],
            ].map(([doc, meta]) => (
              <li
                key={doc}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="text-body text-ink">{doc}</span>
                <span className="font-mono text-caption text-neutral-500">
                  {meta}
                </span>
              </li>
            ))}
          </ul>
        </WireCard>

        <WireCard
          className="col-span-3"
          eyebrow="Pré-visualização"
          title="Relatório"
          aside={<WireBadge tone="neutral">Rascunho</WireBadge>}
        >
          <div className="flex flex-col gap-4 rounded-wire border border-neutral-200 bg-paper-50 p-6">
            <Eyebrow>WeCann · relatório clínico</Eyebrow>
            <p className="font-display text-title font-medium text-ink">
              Marina Castro — dor crônica refratária
            </p>
            <div className="flex flex-col gap-2">
              <div className="h-2 w-full rounded-sm bg-neutral-200" />
              <div className="h-2 w-11/12 rounded-sm bg-neutral-200" />
              <div className="h-2 w-10/12 rounded-sm bg-neutral-200" />
              <div className="h-2 w-9/12 rounded-sm bg-neutral-200" />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {["Conduta", "Evolução", "Anexos"].map((s) => (
                <div
                  key={s}
                  className="flex h-16 items-end rounded-wire border border-neutral-200 bg-paper p-2"
                >
                  <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-400">
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </WireCard>
      </div>
    </ScreenShell>
  );
}

// Estado de sucesso editorial: o checkmark é desenhado com DrawSVG e o título
// display faz reveal. Sob reduced-motion, aparece estático.
function ReportSent({ onReset }: { onReset: () => void }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !root.current) return;
      const check = root.current.querySelector<SVGPathElement>(".report-check");
      const circle = root.current.querySelector<SVGCircleElement>(".report-ring");
      const tl = gsap.timeline();
      if (circle) {
        tl.from(circle, { drawSVG: "0%", duration: 0.55, ease: "power1.inOut" });
      }
      if (check) {
        tl.from(check, { drawSVG: "0%", duration: 0.45, ease: "power2.out" }, "-=0.1");
      }
      tl.from(
        ".report-title",
        { yPercent: 40, opacity: 0, duration: 0.6, ease: "power3.out" },
        "-=0.2",
      ).from(
        ".report-sub",
        { opacity: 0, y: 8, duration: 0.5 },
        "-=0.3",
      );
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <ScreenShell zone="Pós-consulta · terminus" title="Relatório enviado">
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-6 text-center">
          <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" aria-hidden>
            <circle
              className="report-ring"
              cx="32"
              cy="32"
              r="30"
              stroke="var(--color-neutral-300)"
              strokeWidth="1"
            />
            <path
              className="report-check"
              d="M20 33 L29 42 L45 24"
              stroke="var(--color-ink)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="report-title font-display text-display-l font-medium text-ink">
            Relatório enviado
          </p>
          <p className="report-sub max-w-md text-body-l text-neutral-600">
            Marina Castro receberá o relatório completo da jornada por e-mail e
            no portal do paciente.
          </p>
          <WireButton variant="secondary" onClick={onReset}>
            Ver relatório
          </WireButton>
        </div>
      </ScreenShell>
    </div>
  );
}
