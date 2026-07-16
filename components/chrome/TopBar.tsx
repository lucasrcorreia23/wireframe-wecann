"use client";

import { useFlow } from "@/flow/store";
import type { NodeId } from "@/flow/types";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/cn";

// Abas da pílula de navegação (Figma "Iteração 9 de Julho"). "Paciente 360",
// "Documentos" e "Acompanhamento" mapeiam para telas existentes (decisão de
// projeto — sem telas novas nesta fase).
const TABS: { label: string; node: NodeId }[] = [
  { label: "Home", node: "home" },
  { label: "Agenda", node: "agenda" },
  { label: "Paciente 360", node: "patients" },
  { label: "Documentos", node: "clinical-note" },
  { label: "Acompanhamento", node: "clinical-queue" },
  { label: "Casuística", node: "casuistry" },
];

// Header do Figma: logo à esquerda, pílula central de navegação (abas + busca),
// identidade do profissional à direita. Grid 1fr/auto/1fr mantém a pílula no
// centro óptico independentemente da largura do logo/perfil. Durante a intro
// (text/globe) o header fica invisível e faz fade-in junto com os módulos.
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
          "absolute inset-x-0 top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-10 pt-6 pb-4",
          "transition-opacity duration-700",
          introHidden ? "opacity-0" : "opacity-100",
        )}
      >
        {/* ───── Esquerda — logo (asset exato do Figma) ───── */}
        <button
          onClick={() => goTo("home")}
          aria-label="Ir para a Home"
          className="pointer-events-auto flex w-fit items-center"
        >
          <img src="/figma/logo.svg" alt="wecann.care" className="h-[23px] w-[136px]" />
        </button>

        {/* ───── Centro — pílula de navegação + busca ───── */}
        <div className="pointer-events-auto flex items-center">
          <nav
            aria-label="Navegação principal"
            className="flex h-12 items-center gap-6 rounded-[20px] border border-border-soft bg-white px-6"
          >
            {TABS.map((tab) => {
              const active = tab.node === currentNode;
              return (
                <button
                  key={tab.node}
                  onClick={() => goTo(tab.node)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative text-[14px] leading-[1.6] transition-colors",
                    active ? "text-ink" : "text-gray-60 hover:text-ink",
                  )}
                >
                  {tab.label}
                  {active ? (
                    // Traço do Figma: vetor 24×4 renderizado no tamanho nativo.
                    <img
                      src="/figma/nav-underline.svg"
                      alt=""
                      aria-hidden
                      className="absolute -bottom-1.5 left-1/2 h-1 w-6 -translate-x-1/2 max-w-none"
                    />
                  ) : null}
                </button>
              );
            })}

            <span aria-hidden className="w-px self-stretch bg-border-default" />

            <button
              onClick={() => toggleSearch()}
              aria-label="Buscar paciente 360"
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
            >
              <img src="/figma/icon-search.svg" alt="" className="size-[22px]" />
              <span className="text-[14px] leading-[1.6] text-[#8b8b8c]">Buscar</span>
            </button>
          </nav>
        </div>

        {/* ───── Direita — identidade do profissional ───── */}
        <div className="pointer-events-auto flex items-center justify-end gap-4">
          <div className="flex flex-col items-end leading-[1.4]">
            <span className="font-display text-[16px] font-medium text-ink">
              Dr. Ricardo Rodrigues
            </span>
            <span className="text-[12px] text-secondary">Neuro · CRM-SP 123456</span>
          </div>
          {/* Avatar com a foto do Figma (crop reproduzido do node). */}
          <button
            aria-label="Perfil"
            className="relative size-10 shrink-0 overflow-hidden rounded-full"
          >
            <img
              src="/figma/avatar.png"
              alt=""
              className="absolute top-[-26.64%] left-[-7.5%] h-[153.29%] w-[115%] max-w-none"
            />
          </button>
        </div>
      </header>

      <SearchBar />
    </>
  );
}
