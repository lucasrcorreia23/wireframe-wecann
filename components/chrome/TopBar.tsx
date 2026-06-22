"use client";

import { useFlow, useCanBack } from "@/flow/store";
import { NavMenu } from "./NavMenu";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/cn";

// Barra superior: [voltar] [menu] [busca] à esquerda; avatar do profissional à
// direita. Menu abre o dropdown grande; busca abre a barra no topo.
export function TopBar() {
  const toggleMenu = useFlow((s) => s.toggleMenu);
  const toggleSearch = useFlow((s) => s.toggleSearch);
  const back = useFlow((s) => s.back);
  const canBack = useCanBack();

  return (
    <>
      {/* Esquerda — menu + busca (+ voltar) */}
      <div className="pointer-events-auto absolute left-4 top-5 z-20 flex items-center gap-2">
        {canBack ? (
          <IconButton label="Voltar" onClick={back}>
            <i className="bx bx-arrow-back text-xl" />
          </IconButton>
        ) : null}
        <IconButton label="Menu" onClick={() => toggleMenu()}>
          <i className="bx bx-menu text-xl" />
        </IconButton>
        <IconButton label="Buscar paciente" onClick={() => toggleSearch()}>
          <i className="bx bx-search text-xl" />
        </IconButton>
      </div>

      {/* Direita — avatar do profissional logado */}
      <div className="pointer-events-auto absolute right-4 top-5 z-20">
        <button
          aria-label="Profissional"
          className="flex items-center gap-2 rounded-full border border-white/50 bg-white/45 py-1.5 pl-1.5 pr-3 backdrop-blur transition-colors hover:border-ink/25"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-mono text-micro text-paper">
            HP
          </span>
          <span className="hidden text-caption font-medium text-ink sm:block">
            Dra. Helena
          </span>
          <i className="bx bx-chevron-down text-base text-neutral-500" />
        </button>
      </div>

      <NavMenu />
      <SearchBar />
    </>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-white/45 text-body text-ink backdrop-blur",
        "transition-colors hover:border-ink/30 hover:bg-white/60",
      )}
    >
      {children}
    </button>
  );
}
