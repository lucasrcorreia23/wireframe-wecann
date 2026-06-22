import { create } from "zustand";
import type { NodeId, Panel } from "./types";
import { NODES } from "./graph";

type FlowState = {
  currentNode: NodeId;
  history: NodeId[];
  /** Dropdown de navegação (menu ☰) aberto. */
  menuOpen: boolean;
  /** Barra de busca (⌕) aberta. */
  searchOpen: boolean;
  /** Incrementa a cada navegação — sinal para a CameraRig disparar o timeline. */
  travelToken: number;

  goTo: (id: NodeId) => void;
  back: () => void;
  toggleMenu: (open?: boolean) => void;
  toggleSearch: (open?: boolean) => void;
};

export const useFlow = create<FlowState>((set, get) => ({
  currentNode: "home",
  history: [],
  menuOpen: false,
  searchOpen: false,
  travelToken: 0,

  goTo: (id) => {
    const { currentNode } = get();
    if (id === currentNode) {
      // Mesmo nó: apenas fecha overlays de navegação.
      set({ menuOpen: false, searchOpen: false });
      return;
    }
    set((s) => ({
      currentNode: id,
      history: [...s.history, currentNode],
      travelToken: s.travelToken + 1,
      menuOpen: false,
      searchOpen: false,
    }));
  },

  back: () => {
    const { history } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set((s) => ({
      currentNode: prev,
      history: s.history.slice(0, -1),
      travelToken: s.travelToken + 1,
      menuOpen: false,
      searchOpen: false,
    }));
  },

  // Abrir um fecha o outro.
  toggleMenu: (open) =>
    set((s) => {
      const next = open ?? !s.menuOpen;
      return { menuOpen: next, searchOpen: next ? false : s.searchOpen };
    }),
  toggleSearch: (open) =>
    set((s) => {
      const next = open ?? !s.searchOpen;
      return { searchOpen: next, menuOpen: next ? false : s.menuOpen };
    }),
}));

// ───────────────────────── Selectors derivados ─────────────────────────

/** Painéis companheiros ativos no nó atual (zona Consulta §3.2). */
export function useActivePanels(): Panel[] {
  return useFlow((s) => NODES[s.currentNode].panels);
}

/** Verdadeiro quando o nó atual está na zona Consulta (mostra companheiros). */
export function useInConsulta(): boolean {
  return useFlow((s) => NODES[s.currentNode].zone === "consulta");
}

export function useCanBack(): boolean {
  return useFlow((s) => s.history.length > 0);
}
