import type { FlowNode, NodeId, Zone } from "./types";

// Espaçamento do trilho ao longo de −Z e offset lateral dos ramos (§3.1).
const STEP = 16;
const SIDE = 11;
const z = (i: number): number => -i * STEP;

// Trilho com estações. Spine ao longo de −Z; ramos laterais a partir da home.
//
//  home ─ pre-review ─ consult ─ clinical-note ─ casuistry ─ report (TERMINUS)
//   │(L)                         (Notas clínicas: hub que resume
//  clinical-queue                 todo o pós-consulta numa tela só)
export const NODES: Record<NodeId, FlowNode> = {
  home: {
    id: "home",
    zone: "pre",
    title: "Painel do dia",
    position: [0, 0, z(0)],
    panels: [],
    next: "pre-review",
  },
  agenda: {
    id: "agenda",
    zone: "pre",
    title: "Agenda",
    // Ramo lateral a partir da home (espelho de clinical-queue, lado +X).
    position: [SIDE, 0, z(0.5)],
    panels: [],
  },
  // Módulos utilitários acessados pelo menu (ramos laterais, fora do caminho-ouro).
  messages: {
    id: "messages",
    zone: "pre",
    title: "Mensagens",
    position: [SIDE * 1.4, 0, z(0.9)],
    panels: [],
  },
  patients: {
    id: "patients",
    zone: "pre",
    title: "Pacientes",
    position: [-SIDE * 1.4, 0, z(0.9)],
    panels: [],
  },
  utilities: {
    id: "utilities",
    zone: "pre",
    title: "Utilidades",
    position: [SIDE * 1.4, 0, z(1.5)],
    panels: [],
  },
  "clinical-queue": {
    id: "clinical-queue",
    zone: "pre",
    title: "Fila de dúvidas clínicas",
    position: [-SIDE, 0, z(0.5)],
    panels: [],
    next: "home",
  },
  "pre-review": {
    id: "pre-review",
    zone: "pre",
    title: "Revisão da pré-consulta",
    position: [0, 0, z(1)],
    panels: [],
    next: "consult",
  },
  consult: {
    id: "consult",
    zone: "consulta",
    title: "Tela de consulta",
    position: [0, 0, z(2)],
    panels: ["patient360", "transcription"],
    next: "analise",
  },
  // Análise pós-chamada: o médico revisa/valida o que a Athena preencheu durante
  // a consulta (síntese + abas). Alcançada ao ENCERRAR a vídeo-chamada (consult.next).
  analise: {
    id: "analise",
    zone: "pos",
    title: "Análise",
    position: [0, 0, z(2.5)],
    panels: [],
  },
  "clinical-note": {
    id: "clinical-note",
    zone: "pos",
    title: "Notas clínicas",
    position: [0, 0, z(3)],
    panels: [],
    next: "casuistry",
  },
  casuistry: {
    id: "casuistry",
    zone: "pos",
    title: "Casuística e evolução",
    position: [0, 0, z(4)],
    panels: [],
    next: "report",
  },
  report: {
    id: "report",
    zone: "pos",
    title: "Relatório final",
    position: [0, 0, z(5)],
    panels: [],
    terminus: true,
  },
};

/** Ordem do caminho vivo (pós-redução para 2D). Os nós desativados saem daqui. */
export const GOLDEN_PATH: NodeId[] = ["home", "consult", "analise"];

export const ALL_NODE_IDS = Object.keys(NODES) as NodeId[];

export const ZONE_LABEL: Record<Zone, string> = {
  pre: "Pré-consulta",
  consulta: "Consulta",
  pos: "Pós-consulta",
};

export function getNode(id: NodeId): FlowNode {
  return NODES[id];
}

/** Vizinhos imediatos de um nó (para montar Html só de ativa + adjacentes §4/Fase4). */
export function neighborsOf(id: NodeId): NodeId[] {
  const node = NODES[id];
  const set = new Set<NodeId>();
  if (node.next) set.add(node.next);
  if (node.branch) set.add(node.branch);
  if (node.fork) {
    set.add(node.fork.yes.to);
    set.add(node.fork.no.to);
  }
  // inclui quem aponta para este nó (vizinhança reversa)
  for (const other of ALL_NODE_IDS) {
    const o = NODES[other];
    if (o.next === id || o.branch === id) set.add(other);
    if (o.fork && (o.fork.yes.to === id || o.fork.no.to === id)) set.add(other);
  }
  set.delete(id);
  return [...set];
}
