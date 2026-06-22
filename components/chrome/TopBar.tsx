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

      {/* Direita — avatar do profissional (só o círculo, com um rosto) */}
      <div className="pointer-events-auto absolute right-4 top-5 z-20">
        <button
          aria-label="Perfil"
          className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-white/50 bg-white/45 text-neutral-700 backdrop-blur transition-colors hover:border-ink/30 hover:text-ink"
        >
          <i className="bx bxs-user text-2xl" />
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
