import type { FlowNode, NodeId, Zone } from "./types";

// Espaçamento do trilho ao longo de −Z e offset lateral dos ramos (§3.1).
const STEP = 16;
const SIDE = 11;
const z = (i: number): number => -i * STEP;

// Trilho com estações. Spine ao longo de −Z; forks deslocam em ±X e reentram.
//
//  home ─ pre-review ─ consult ─ clinical-note ─ prescription ─┐
//   │(L)                                                        │(controle especial?)
//  clinical-queue                              reinforced-confirm(R) ─┐
//                                                               └─ closure ─ clinical-safety ─┐
//                                                  (grau 3?) immediate-contact(R) ┐  prescription-renewal(L) ┐
//                                                               clinical-doubts-reports ◄──────────┴──────────┘
//                                                                     │
//                                                               casuistry ─ report (TERMINUS)
export const NODES: Record<NodeId, FlowNode> = {
  home: {
    id: "home",
    zone: "pre",
    title: "Painel do dia",
    position: [0, 0, z(0)],
    panels: [],
    next: "pre-review",
    branch: "clinical-queue",
  },
  agenda: {
    id: "agenda",
    zone: "pre",
    title: "Agenda",
    // Ramo lateral a partir da home (espelho de clinical-queue, lado +X).
    position: [SIDE, 0, z(0.5)],
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
    next: "clinical-note",
  },
  "clinical-note": {
    id: "clinical-note",
    zone: "consulta",
    title: "Nota clínica",
    position: [0, 0, z(3)],
    panels: ["patient360", "copilot"],
    next: "prescription",
  },
  prescription: {
    id: "prescription",
    zone: "consulta",
    title: "Prescrição e conduta",
    position: [0, 0, z(4)],
    panels: ["patient360"],
    next: "closure",
    fork: {
      question: "Controle especial?",
      yes: { label: "Sim", to: "reinforced-confirm" },
      no: { label: "Não", to: "closure" },
    },
  },
  "reinforced-confirm": {
    id: "reinforced-confirm",
    zone: "consulta",
    title: "Confirmação reforçada",
    position: [SIDE, 0, z(4.5)],
    panels: [],
    next: "closure",
  },
  closure: {
    id: "closure",
    zone: "consulta",
    title: "Encerramento",
    position: [0, 0, z(5)],
    panels: [],
    next: "clinical-safety",
  },
  "clinical-safety": {
    id: "clinical-safety",
    zone: "pos",
    title: "Segurança clínica",
    position: [0, 0, z(6)],
    panels: [],
    next: "prescription-renewal",
    fork: {
      question: "Grau 3 (crítico)?",
      yes: { label: "Sim", to: "immediate-contact" },
      no: { label: "Não", to: "prescription-renewal" },
    },
  },
  "immediate-contact": {
    id: "immediate-contact",
    zone: "pos",
    title: "Contato e ajuste imediato",
    position: [SIDE, 0, z(6.5)],
    panels: [],
    next: "clinical-doubts-reports",
  },
  "prescription-renewal": {
    id: "prescription-renewal",
    zone: "pos",
    title: "Renovação de receitas",
    position: [-SIDE, 0, z(6.5)],
    panels: [],
    next: "clinical-doubts-reports",
  },
  "clinical-doubts-reports": {
    id: "clinical-doubts-reports",
    zone: "pos",
    title: "Dúvidas clínicas e laudos",
    position: [0, 0, z(7.5)],
    panels: [],
    next: "casuistry",
  },
  casuistry: {
    id: "casuistry",
    zone: "pos",
    title: "Casuística e evolução",
    position: [0, 0, z(8.5)],
    panels: [],
    next: "report",
  },
  report: {
    id: "report",
    zone: "pos",
    title: "Relatório final",
    position: [0, 0, z(9.5)],
    panels: [],
    terminus: true,
  },
};

/** Ordem do caminho-ouro (travessia padrão) para o stepper e prefetch de vizinhos. */
export const GOLDEN_PATH: NodeId[] = [
  "home",
  "pre-review",
  "consult",
  "clinical-note",
  "prescription",
  "reinforced-confirm",
  "closure",
  "clinical-safety",
  "immediate-contact",
  "prescription-renewal",
  "clinical-doubts-reports",
  "casuistry",
  "report",
];

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
