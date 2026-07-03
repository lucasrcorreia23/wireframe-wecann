"use client";

import { useFlow } from "@/flow/store";
import type { NodeId } from "@/flow/types";
import { Avatar, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

// Header GLOBAL e persistente (padrão Figma 4952:10612) — substitui a antiga barra
// auto-hide de menu/busca. Layout: logotipo à esquerda · navegação central em
// pílulas (barra branca única) · à direita busca (abre o overlay SearchBar), bloco
// nome/CRM e avatar. Navegação é o flow store (jump direto). Sem `justify-between`:
// laterais em `flex-1` mantêm as pílulas centradas.
const NAV: { label: string; node: NodeId }[] = [
  { label: "Home", node: "home" },
  { label: "Agenda", node: "agenda" },
  { label: "Pacientes", node: "patients" },
  { label: "Acompanhamento", node: "acompanhamento" },
  { label: "Casuística", node: "casuistry" },
  { label: "Documentos", node: "documents" },
  { label: "Mensagens", node: "messages" },
];

export function TopBar() {
  const currentNode = useFlow((s) => s.currentNode);
  const goTo = useFlow((s) => s.goTo);
  const toggleSearch = useFlow((s) => s.toggleSearch);

  return (
    <header className="relative z-40 flex shrink-0 items-center gap-4 px-6 py-4">
      {/* Esquerda — logotipo (wordmark). */}
      <div className="flex flex-1 items-center">
        <button
          type="button"
          onClick={() => goTo("home")}
          aria-label="WeCann — início"
          className="font-display text-body-l font-medium text-neutral-500 transition-colors hover:text-ink"
        >
          wecann<span className="text-neutral-400">.care</span>
        </button>
      </div>

      {/* Centro — navegação em pílulas (barra branca única). */}
      <nav className="flex shrink-0 items-center gap-6 rounded-[38px] bg-paper px-6 py-4 shadow-[0_4px_13.5px_rgba(0,0,0,0.05)]">
        {NAV.map((it) => {
          const active = it.node === currentNode;
          return (
            <button
              key={it.label}
              type="button"
              onClick={() => goTo(it.node)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap font-display text-caption font-medium transition-colors",
                active ? "text-ink" : "text-ink/50 hover:text-ink/80",
              )}
            >
              {it.label}
            </button>
          );
        })}
      </nav>

      {/* Direita — busca + nome/CRM + avatar. */}
      <div className="flex flex-1 items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => toggleSearch()}
          aria-label="Buscar paciente"
          className="grid h-10 w-10 place-items-center rounded-full text-ink/70 transition-colors hover:bg-white/60 hover:text-ink"
        >
          <Icon name="search" size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end leading-tight">
            <span className="text-caption font-medium text-ink">
              Ricardo Rodrigues
            </span>
            <span className="text-micro text-neutral-600">CRM/SP 000001</span>
          </div>
          <Avatar
            name="Ricardo Rodrigues"
            seed="ricardo-rodrigues"
            size="md"
            className="h-12 w-12 border-2 border-neutral-300"
          />
        </div>
      </div>
    </header>
  );
}
