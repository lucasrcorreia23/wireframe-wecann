"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, Flip } from "@/lib/gsap";
import { useFlow } from "@/flow/store";
import { NODES } from "@/flow/graph";
import { Eyebrow, WireBadge } from "@/components/ui";
import { cn } from "@/lib/cn";

// Painéis companheiros (§3.2): só na zona Consulta, conscientes do nó atual.
// Paciente 360 (esq., colapsa↔expande com Flip) e Copiloto/Transcrição (dir.).
export function CompanionPanels() {
  const currentNode = useFlow((s) => s.currentNode);
  const node = NODES[currentNode];

  if (node.zone !== "consulta" || node.panels.length === 0) return null;

  return (
    <>
      {node.panels.includes("patient360") ? <Patient360 /> : null}
      {(node.panels.includes("transcription") ||
        node.panels.includes("copilot")) && (
        <RightPanel
          mode={node.panels.includes("transcription") ? "transcription" : "copilot"}
        />
      )}
    </>
  );
}

function Patient360() {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  const flipState = useRef<Flip.FlipState | null>(null);

  const toggle = () => {
    if (!root.current) return;
    flipState.current = Flip.getState(root.current.querySelectorAll("[data-flip]"));
    setOpen((o) => !o);
  };

  useGSAP(
    () => {
      if (flipState.current) {
        Flip.from(flipState.current, {
          duration: 0.42,
          ease: "power2.out",
          absolute: true,
        });
        flipState.current = null;
      }
    },
    { dependencies: [open], scope: root },
  );

  return (
    <div
      ref={root}
      className="panel-in-left pointer-events-auto absolute left-20 top-24 z-20"
    >
      <div
        data-flip
        className={cn(
          "flex flex-col gap-3 rounded-wire border border-neutral-200 bg-paper/95 p-4 backdrop-blur",
          open ? "w-72" : "w-16 items-center",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-neutral-300 font-mono text-micro text-neutral-600">
            MC
          </span>
          <button
            onClick={toggle}
            aria-expanded={open}
            aria-label={open ? "Recolher Paciente 360" : "Expandir Paciente 360"}
            className="font-mono text-micro text-neutral-400 hover:text-ink"
          >
            {open ? "—" : "+"}
          </button>
        </div>

        {open ? (
          <div data-flip className="flex flex-col gap-4">
            <Eyebrow>Paciente 360</Eyebrow>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-400">
                Condições e alergias
              </span>
              <div className="flex flex-wrap gap-1.5">
                <WireBadge>Fibromialgia</WireBadge>
                <WireBadge tone="mid">Alergia: dipirona</WireBadge>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-400">
                Medicações ativas
              </span>
              <ul className="font-mono text-caption text-neutral-700">
                <li>Tramadol 50mg · 2×/dia</li>
                <li>Amitriptilina 25mg · noite</li>
              </ul>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-400">
                Timeline e exames
              </span>
              <span className="font-mono text-micro text-neutral-500">
                ●──●──● ressonância · hemograma
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RightPanel({ mode }: { mode: "transcription" | "copilot" }) {
  return (
    <div className="panel-in-right pointer-events-auto absolute right-5 top-24 z-20 w-80">
      <div className="flex flex-col gap-3 rounded-wire border border-neutral-200 bg-paper/95 p-4 backdrop-blur">
        {mode === "transcription" ? (
          <>
            <div className="flex items-center justify-between">
              <Eyebrow>Transcrição</Eyebrow>
              <WireBadge tone="mid">Ao vivo</WireBadge>
            </div>
            <div className="flex flex-col gap-2">
              {[
                ["Médica", "Como tem sido a dor desde a última visita?"],
                ["Paciente", "Continua forte à noite, atrapalha o sono."],
              ].map(([who, line], i) => (
                <div key={i} className="flex gap-2">
                  <span className="w-16 shrink-0 font-mono text-micro uppercase text-neutral-400">
                    {who}
                  </span>
                  <p className="text-caption text-neutral-700">{line}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-neutral-200 pt-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-state-mid" />
              <span className="font-mono text-micro text-neutral-500">
                Somente do modelo selecionado
              </span>
            </div>
          </>
        ) : (
          <>
            <Eyebrow>Copiloto</Eyebrow>
            <ul className="flex flex-col gap-2">
              {[
                "Investigar qualidade do sono.",
                "Confirmar desmame de opioide.",
                "Sugerir escala de dor (PROM).",
              ].map((tip, i) => (
                <li key={i} className="flex gap-2 text-caption text-neutral-700">
                  <span className="font-mono text-neutral-400">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
