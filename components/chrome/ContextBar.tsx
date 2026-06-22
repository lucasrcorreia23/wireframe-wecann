"use client";

import { useFlow } from "@/flow/store";
import { NODES, ZONE_LABEL } from "@/flow/graph";
import type { Zone } from "@/flow/types";

const ZONES: Zone[] = ["pre", "consulta", "pos"];

// Context bar (topo, minimalista §3.2): fase atual + identidade do paciente
// quando em fluxo. Sempre nítida, acima do canvas.
export function ContextBar() {
  const currentNode = useFlow((s) => s.currentNode);
  const node = NODES[currentNode];
  const showPatient =
    node.id !== "home" && node.id !== "clinical-queue" && node.id !== "agenda";

  return (
    <div className="pointer-events-auto absolute left-1/2 top-5 flex -translate-x-1/2 items-center gap-4 rounded-wire border border-neutral-200 bg-paper/85 px-4 py-2 backdrop-blur">
      {/* Trilha de fases */}
      <div className="flex items-center gap-2">
        {ZONES.map((z, i) => (
          <div key={z} className="flex items-center gap-2">
            <span
              className={
                "font-mono text-micro uppercase tracking-[0.14em] transition-colors " +
                (z === node.zone ? "text-ink" : "text-neutral-400")
              }
            >
              {ZONE_LABEL[z]}
            </span>
            {i < ZONES.length - 1 ? (
              <span className="text-neutral-300">→</span>
            ) : null}
          </div>
        ))}
      </div>

      {showPatient ? (
        <>
          <span className="h-4 w-px bg-neutral-300" />
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full border border-neutral-300 font-mono text-micro text-neutral-600">
              MC
            </span>
            <span className="text-caption font-medium text-ink">
              Marina Castro
            </span>
            <span className="font-mono text-micro text-neutral-400">· 34a</span>
          </div>
        </>
      ) : null}
    </div>
  );
}
