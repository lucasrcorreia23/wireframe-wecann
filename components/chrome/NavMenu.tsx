"use client";

import { useEffect } from "react";
import { useFlow } from "@/flow/store";
import type { NodeId } from "@/flow/types";
import { cn } from "@/lib/cn";

const ITEMS: { label: string; node: NodeId; icon: string }[] = [
  { label: "Home", node: "home", icon: "bx-home-alt" },
  { label: "Agenda", node: "agenda", icon: "bx-calendar" },
  { label: "Mensagens", node: "messages", icon: "bx-envelope" },
  { label: "Pacientes", node: "patients", icon: "bx-group" },
  { label: "Casuísticas", node: "casuistry", icon: "bx-bar-chart-alt-2" },
  { label: "Utilidades", node: "utilities", icon: "bx-wrench" },
];

// Dropdown grande de navegação, ancorado ao botão de menu (topo-esquerda).
export function NavMenu() {
  const open = useFlow((s) => s.menuOpen);
  const toggleMenu = useFlow((s) => s.toggleMenu);
  const goTo = useFlow((s) => s.goTo);
  const currentNode = useFlow((s) => s.currentNode);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, toggleMenu]);

  if (!open) return null;

  return (
    <>
      <div
        className="pointer-events-auto fixed inset-0 z-30"
        onClick={() => toggleMenu(false)}
      />
      <div className="panel-in-left pointer-events-auto fixed left-4 top-[68px] z-40 w-72">
        <div className="glass-panel-blue flex flex-col gap-1 rounded-[24px] p-3">
          {ITEMS.map((it) => {
            const active = it.node === currentNode;
            return (
              <button
                key={it.node}
                onClick={() => goTo(it.node)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors",
                  active
                    ? "bg-white/60 text-ink"
                    : "text-neutral-700 hover:bg-white/40",
                )}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/55">
                  <i className={`bx ${it.icon} text-lg`} />
                </span>
                <span className="text-body font-medium">{it.label}</span>
              </button>
            );
          })}

          <div className="my-1 h-px bg-white/40" />

          <button
            onClick={() => toggleMenu(false)}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-neutral-600 transition-colors hover:bg-white/40"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/55">
              <i className="bx bx-log-out text-lg" />
            </span>
            <span className="text-body font-medium">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
}
