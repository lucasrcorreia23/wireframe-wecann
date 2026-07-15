"use client";

import { useFlow } from "@/flow/store";
import type { NodeId } from "@/flow/types";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/cn";

// Abas da pílula de navegação (layout home.png). "Paciente 360", "Documentos" e
// "Acompanhamento" mapeiam para telas existentes (decisão de projeto — sem
// telas novas nesta fase).
const TABS: { label: string; node: NodeId }[] = [
  { label: "Home", node: "home" },
  { label: "Agenda", node: "agenda" },
  { label: "Paciente 360", node: "patients" },
  { label: "Documentos", node: "clinical-note" },
  { label: "Acompanhamento", node: "clinical-queue" },
  { label: "Casuística", node: "casuistry" },
];

// Header do redesign (home.png): logo à esquerda, pílula central de navegação
// (abas + busca) com botão "+" ao lado, identidade do profissional à direita.
// Grid 1fr/auto/1fr mantém a pílula no centro óptico independentemente da
// largura do logo/perfil. Durante a intro (text/globe) o header fica invisível
// e faz fade-in junto com os módulos — preserva a abertura editorial limpa.
export function TopBar() {
  const goTo = useFlow((s) => s.goTo);
  const currentNode = useFlow((s) => s.currentNode);
  const toggleSearch = useFlow((s) => s.toggleSearch);
  const introPhase = useFlow((s) => s.introPhase);
  const introHidden = introPhase === "text" || introPhase === "globe";

  return (
    <>
      <header
        className={cn(
          "absolute inset-x-0 top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4",
          "transition-opacity duration-700",
          introHidden ? "opacity-0" : "opacity-100",
        )}
      >
        {/* ───── Esquerda — logo ───── */}
        <button
          onClick={() => goTo("home")}
          aria-label="Ir para a Home"
          className="pointer-events-auto flex w-fit items-center gap-2.5"
        >
          <LogoMark />
          <span className="font-display text-[1.3rem] font-medium tracking-tight text-ink">
            wecann.care
          </span>
        </button>

        {/* ───── Centro — pílula de navegação + novo agendamento ───── */}
        <div className="pointer-events-auto flex items-center gap-3">
          <nav
            aria-label="Navegação principal"
            className="card-soft flex items-center gap-1 rounded-full px-2.5 py-1.5"
          >
            {TABS.map((tab) => {
              const active = tab.node === currentNode;
              return (
                <button
                  key={tab.node}
                  onClick={() => goTo(tab.node)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-3 py-1.5 text-caption transition-colors",
                    active
                      ? "font-medium text-ink"
                      : "text-neutral-500 hover:text-ink",
                  )}
                >
                  {tab.label}
                  {active ? (
                    <span
                      aria-hidden
                      className="brand-underline absolute inset-x-2.5 bottom-0 h-[3px] rounded-full"
                    />
                  ) : null}
                </button>
              );
            })}

            <span aria-hidden className="mx-1.5 h-5 w-px bg-neutral-200" />

            <button
              onClick={() => toggleSearch()}
              aria-label="Buscar paciente 360"
              className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-neutral-400 transition-colors hover:text-ink"
            >
              <i className="bx bx-search text-lg" />
              <span className="text-caption">Buscar</span>
            </button>
          </nav>

          {/* Novo agendamento — inerte nesta fase (Home só visual). */}
          <button
            aria-label="Novo agendamento"
            className="card-soft grid h-10 w-10 place-items-center rounded-full text-neutral-600 transition-colors hover:text-ink"
          >
            <i className="bx bx-plus text-xl" />
          </button>
        </div>

        {/* ───── Direita — identidade do profissional ───── */}
        <div className="pointer-events-auto flex items-center justify-end gap-3">
          <div className="flex flex-col items-end">
            <span className="font-display text-body font-medium leading-tight text-ink">
              Dr. Ricardo Rodrigues
            </span>
            <span className="text-micro text-neutral-500">
              Neuro · CRM-SP 123456
            </span>
          </div>
          {/* Avatar placeholder (sem foto no repo): iniciais sobre fundo suave. */}
          <button
            aria-label="Perfil"
            className="card-soft grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full font-mono text-micro font-medium text-neutral-600"
          >
            RR
          </button>
        </div>
      </header>

      <SearchBar />
    </>
  );
}

// Mark da wecann.care: cluster de pontos nas cores de marca (aproximação do
// print — roxo/laranja/azul sobrepostos com leve translucidez).
function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
      <circle cx="9" cy="8.5" r="5" fill="var(--color-brand-purple)" opacity="0.9" />
      <circle cx="17" cy="10" r="5" fill="var(--color-brand-orange)" opacity="0.85" />
      <circle cx="11.5" cy="17" r="5" fill="var(--color-brand-blue)" opacity="0.85" />
    </svg>
  );
}
