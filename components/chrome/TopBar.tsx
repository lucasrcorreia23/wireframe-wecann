"use client";

import { useFlow } from "@/flow/store";
import { NavMenu } from "./NavMenu";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/cn";

// Barra superior: [menu] [busca] (ghost) à esquerda; avatar à direita. O "voltar"
// não vive aqui — fica dentro das telas, ao lado do título.
export function TopBar() {
  const toggleMenu = useFlow((s) => s.toggleMenu);
  const toggleSearch = useFlow((s) => s.toggleSearch);

  return (
    <>
      {/* Esquerda — menu + busca (ghost, discretos) */}
      <div className="pointer-events-auto absolute left-3 top-4 z-20 flex items-center gap-1">
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
        // Ghost: sem fundo/borda por padrão; hover sutil.
        "grid h-9 w-9 place-items-center rounded-full text-ink/70",
        "transition-colors hover:bg-white/45 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
