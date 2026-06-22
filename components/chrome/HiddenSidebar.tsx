"use client";

import { useState } from "react";
import { useFlow, useCanBack } from "@/flow/store";
import { NODES, ZONE_LABEL } from "@/flow/graph";
import type { NodeId, Zone } from "@/flow/types";
import { cn } from "@/lib/cn";

// Ordem de navegação por fase (saltos de fase §3.2).
const GROUPS: { zone: Zone; nodes: NodeId[] }[] = [
  { zone: "pre", nodes: ["home", "agenda", "pre-review", "clinical-queue"] },
  {
    zone: "consulta",
    nodes: [
      "consult",
      "clinical-note",
      "prescription",
      "reinforced-confirm",
      "closure",
    ],
  },
  {
    zone: "pos",
    nodes: [
      "clinical-safety",
      "immediate-contact",
      "prescription-renewal",
      "clinical-doubts-reports",
      "casuistry",
      "report",
    ],
  },
];

// Sidebar escondida (§3.2): rail colapsada num ícone; expande no hover, clique ou
// foco de teclado. Navegação global + saltos de fase. Mantém trigger-icon fixo.
export function HiddenSidebar() {
  const currentNode = useFlow((s) => s.currentNode);
  const goTo = useFlow((s) => s.goTo);
  const back = useFlow((s) => s.back);
  const sidebarOpen = useFlow((s) => s.sidebarOpen);
  const toggleSidebar = useFlow((s) => s.toggleSidebar);
  const canBack = useCanBack();

  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const expanded = sidebarOpen || hover || focus;

  return (
    <nav
      aria-label="Navegação do fluxo"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setFocus(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocus(false);
      }}
      className={cn(
        "pointer-events-auto absolute left-0 top-0 z-20 flex h-full flex-col border-r border-neutral-200 bg-paper/90 backdrop-blur",
        "transition-[width] duration-300 ease-out",
        expanded ? "w-64" : "w-14",
      )}
    >
      {/* Trigger fixo (marca + pin) */}
      <button
        onClick={() => toggleSidebar()}
        aria-pressed={sidebarOpen}
        aria-label={sidebarOpen ? "Desafixar navegação" : "Fixar navegação"}
        className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 px-4"
      >
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-wire bg-ink font-mono text-micro font-bold text-paper">
          W
        </span>
        <span
          className={cn(
            "whitespace-nowrap font-display text-body font-medium text-ink transition-opacity duration-200",
            expanded ? "opacity-100" : "opacity-0",
          )}
        >
          WeCann
        </span>
      </button>

      {/* Grupos por fase */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {GROUPS.map((g) => (
          <div key={g.zone} className="mb-4">
            <span
              className={cn(
                "block px-2 pb-1 font-mono text-micro uppercase tracking-[0.12em] text-neutral-400 transition-opacity duration-200",
                expanded ? "opacity-100" : "opacity-0",
              )}
            >
              {ZONE_LABEL[g.zone]}
            </span>
            <ul className="flex flex-col gap-0.5">
              {g.nodes.map((id) => {
                const active = id === currentNode;
                return (
                  <li key={id}>
                    <button
                      onClick={() => goTo(id)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-wire px-2 py-1.5 text-left transition-colors",
                        active
                          ? "bg-neutral-100 text-ink"
                          : "text-neutral-500 hover:bg-paper-50 hover:text-ink",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          active ? "bg-ink" : "bg-neutral-300",
                        )}
                      />
                      <span
                        className={cn(
                          "truncate text-caption transition-opacity duration-200",
                          expanded ? "opacity-100" : "opacity-0",
                        )}
                      >
                        {NODES[id].title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Voltar */}
      <div className="shrink-0 border-t border-neutral-200 p-2">
        <button
          onClick={back}
          disabled={!canBack}
          className={cn(
            "flex w-full items-center gap-3 rounded-wire px-2 py-1.5 transition-colors",
            canBack
              ? "text-neutral-600 hover:bg-paper-50 hover:text-ink"
              : "cursor-not-allowed text-neutral-300",
          )}
        >
          <span className="w-1.5 shrink-0 text-center">←</span>
          <span
            className={cn(
              "text-caption transition-opacity duration-200",
              expanded ? "opacity-100" : "opacity-0",
            )}
          >
            Voltar
          </span>
        </button>
      </div>
    </nav>
  );
}
