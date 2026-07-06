// Fonte única dos tipos de documento e modelos simples — consumida pelo módulo
// Documentos (DocumentsScreen) e pelo wizard "Gerar documento" do Paciente 360
// (GenerateDocumentModal). Mesmo padrão do appointments.ts (mock compartilhado).

export type DocType =
  | "prescricao" | "exames" | "atestado" | "laudo" | "encaminhamento"
  | "cirurgia" | "opme" | "sumario" | "orientacoes" | "tcle";

export const DOC_TYPES: { key: DocType; label: string; icon: string }[] = [
  { key: "prescricao", label: "Prescrição", icon: "capsule" },
  { key: "exames", label: "Exames", icon: "test-tube" },
  { key: "atestado", label: "Atestado", icon: "file" },
  { key: "laudo", label: "Laudo", icon: "clipboard" },
  { key: "encaminhamento", label: "Encaminhamento", icon: "send" },
  { key: "cirurgia", label: "Cirurgia", icon: "hand-heart" },
  { key: "opme", label: "OPME", icon: "wrench" },
  { key: "sumario", label: "Sumário", icon: "book-open" },
  { key: "orientacoes", label: "Orientações", icon: "heart" },
  { key: "tcle", label: "TCLE", icon: "file-signature" },
];

export const SIMPLE_TEMPLATES: Record<string, string[]> = {
  atestado: ["Atestado de comparecimento", "Atestado de afastamento (CID)", "Atestado para atividade física"],
  laudo: ["Laudo para importação (ANVISA)", "Laudo de evolução clínica"],
  encaminhamento: ["Encaminhamento — Reumatologia", "Encaminhamento — Psiquiatria"],
  cirurgia: ["Solicitação de procedimento cirúrgico"],
  opme: ["Solicitação de OPME"],
  sumario: ["Sumário clínico de alta", "Sumário de seguimento"],
  orientacoes: ["Orientações pós-consulta", "Higiene do sono"],
  tcle: ["TCLE — Procedimento"],
};
