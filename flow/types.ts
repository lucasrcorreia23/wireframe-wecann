// Tipos do grafo de fluxo. Os ids casam com SCREENS em components/screens.

export type NodeId =
  | "home"
  | "pre-review"
  | "clinical-queue"
  | "consult"
  | "clinical-note"
  | "prescription"
  | "reinforced-confirm"
  | "closure"
  | "clinical-safety"
  | "immediate-contact"
  | "prescription-renewal"
  | "clinical-doubts-reports"
  | "casuistry"
  | "report";

export type Zone = "pre" | "consulta" | "pos";

/** Painéis companheiros (HUD) que um nó ativa. */
export type Panel = "patient360" | "transcription" | "copilot";

/** Vetor 3D simples (posição/alvo no mundo). */
export type Vec3 = [number, number, number];

/** Fork de decisão: dois ramos rotulados levando a outros nós. */
export type Fork = {
  question: string;
  yes: { label: string; to: NodeId };
  no: { label: string; to: NodeId };
};

export type FlowNode = {
  id: NodeId;
  zone: Zone;
  title: string;
  /** Centro do plano da estação no trilho (a câmera é enquadrada a partir dele). */
  position: Vec3;
  /** HUD ativos quando este nó é o atual. */
  panels: Panel[];
  /** Próximo nó no caminho-ouro (undefined no terminus). */
  next?: NodeId;
  /** Decisão, quando o nó é um ponto de fork. */
  fork?: Fork;
  /** Marca o terminus (report). */
  terminus?: boolean;
  /** Ramo lateral acessível a partir deste nó (ex.: home → clinical-queue). */
  branch?: NodeId;
};
