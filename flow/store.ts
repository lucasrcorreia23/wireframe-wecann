import { create } from "zustand";
import type { NodeId, Panel } from "./types";
import { NODES } from "./graph";

/** Fases da abertura editorial (§6). Máquina de estados linear, roda UMA vez:
 *  text → globe → modules → ready. Sob reduced-motion o driver salta p/ "ready". */
export type IntroPhase = "text" | "globe" | "modules" | "ready";

type FlowState = {
  currentNode: NodeId;
  history: NodeId[];
  /** Nó de onde viemos na última navegação (tela que SAI na transição orbital). */
  prevNode: NodeId | null;
  /** Direção da última navegação — orienta a diagonal da órbita (frente↔volta). */
  lastNav: "forward" | "back" | "none";
  /** Dropdown de navegação (menu ☰) aberto. */
  menuOpen: boolean;
  /** Barra de busca (⌕) aberta. */
  searchOpen: boolean;
  /** Incrementa a cada navegação — sinal para a CameraRig disparar o timeline. */
  travelToken: number;
  /** Fase atual da intro (orquestra globo + módulos + card de texto). */
  introPhase: IntroPhase;
  /** Athena (coluna direita) recolhida no orbe do canto inferior direito. */
  athenaCollapsed: boolean;

  goTo: (id: NodeId) => void;
  back: () => void;
  toggleMenu: (open?: boolean) => void;
  toggleSearch: (open?: boolean) => void;
  setIntroPhase: (phase: IntroPhase) => void;
  toggleAthena: (collapsed?: boolean) => void;
};

export const useFlow = create<FlowState>((set, get) => ({
  currentNode: "home",
  history: [],
  prevNode: null,
  lastNav: "none",
  menuOpen: false,
  searchOpen: false,
  travelToken: 0,
  // Inicia em "text": o estado do server e o 1º render do client coincidem
  // (sem divergência de hidratação). O driver (Intro) salta p/ "ready" se
  // reduced-motion, ou avança as fases na timeline.
  introPhase: "text",
  athenaCollapsed: false,

  goTo: (id) => {
    const { currentNode } = get();
    if (id === currentNode) {
      // Mesmo nó: apenas fecha overlays de navegação.
      set({ menuOpen: false, searchOpen: false });
      return;
    }
    set((s) => ({
      currentNode: id,
      prevNode: currentNode,
      lastNav: "forward",
      history: [...s.history, currentNode],
      travelToken: s.travelToken + 1,
      menuOpen: false,
      searchOpen: false,
      // Ao SAIR da Home, a Athena nasce recolhida (orbe) nas outras telas — o
      // globo "voa" do centro da Home para o canto. (Expandir depois é opção.)
      athenaCollapsed:
        currentNode === "home" && id !== "home" ? true : s.athenaCollapsed,
    }));
  },

  back: () => {
    const { history, currentNode } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set((s) => ({
      currentNode: prev,
      prevNode: currentNode,
      lastNav: "back",
      history: s.history.slice(0, -1),
      travelToken: s.travelToken + 1,
      menuOpen: false,
      searchOpen: false,
      athenaCollapsed:
        currentNode === "home" && prev !== "home" ? true : s.athenaCollapsed,
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

  setIntroPhase: (phase) => set({ introPhase: phase }),

  toggleAthena: (collapsed) =>
    set((s) => ({ athenaCollapsed: collapsed ?? !s.athenaCollapsed })),
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
