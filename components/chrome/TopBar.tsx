"use client";

import { useFlow } from "@/flow/store";
import { NavMenu } from "./NavMenu";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/cn";

// Barra superior (header auto-hide): [menu] [busca] à esquerda; avatar à direita.
// - Por padrão (topo): visível e SEM fundo.
// - Rolando para baixo: sobe e some (translateY), liberando todo o conteúdo.
// - Rolando para cima: reaparece com fundo SÓ de blur (sem cor sólida).
// NavMenu/SearchBar ficam FORA do header (overlays fixos) — o translate do header
// criaria um containing block e os arrastaria junto. O "voltar" vive nas telas.
export function TopBar({
  headerHidden = false,
  headerBlur = false,
}: {
  headerHidden?: boolean;
  headerBlur?: boolean;
}) {
  const toggleMenu = useFlow((s) => s.toggleMenu);
  const toggleSearch = useFlow((s) => s.toggleSearch);

  return (
    <>
      <header
        className={cn(
          // pointer-events-none: a faixa transparente não bloqueia cliques no
          // conteúdo atrás; só os botões reativam os eventos.
          "pointer-events-none absolute inset-x-0 top-0 z-20 h-16",
          // Slide alinhado ao token de painel da plataforma (~420ms, power2.out).
          "transition-transform duration-[420ms] ease-out motion-reduce:transition-none",
          headerHidden ? "-translate-y-full" : "translate-y-0",
        )}
      >
        {/* Fundo SÓ de blur (sem cor), aparece no scroll reverso; ausente no topo.
            Fade por opacidade (suave) + hairline para definição. */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 border-b border-white/30 backdrop-blur-2xl",
            "transition-opacity duration-300 motion-reduce:transition-none",
            headerBlur ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Esquerda — só o menu (ghost). O perfil agora vive dentro do menu. */}
        <div className="pointer-events-auto absolute left-3 top-4 flex items-center gap-1">
          <IconButton label="Menu" onClick={() => toggleMenu()}>
            <i className="bx bx-menu text-xl" />
          </IconButton>
        </div>

        {/* Direita — busca (onde antes ficava o avatar do perfil) */}
        <div className="pointer-events-auto absolute right-3 top-4">
          <IconButton label="Buscar paciente" onClick={() => toggleSearch()}>
            <i className="bx bx-search text-xl" />
          </IconButton>
        </div>
      </header>

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
