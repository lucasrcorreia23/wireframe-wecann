import type { ComponentType } from "react";
import type { ScreenProps } from "./index";
import { HomeCenter } from "./HomeScreen";
import { MessagesCenter, MessagesLeft } from "./MessagesScreen";
import { PatientsCenter } from "./PatientsScreen";
import { ConsultIntroCenter } from "./ConsultIntroScreen";
import { ConsultCenter } from "./ConsultScreen";
import { AgendaCenter } from "./AgendaScreen";
import { PreReviewCenter } from "./PreReviewScreen";
import { AcompanhamentoCenter } from "./AcompanhamentoScreen";
import { CasuistryCenter } from "./CasuistryScreen";
import { DocumentsCenter } from "./DocumentsScreen";
import { ClinicalNoteCenter, ClinicalNoteLeft } from "./ClinicalNoteScreen";

// Cada módulo fornece o conteúdo do CENTRO (foco) e, opcionalmente, da ESQUERDA
// (resumos alimentados pela IA). A coluna DIREITA é sempre o AthenaPanel
// persistente do WorkspaceShell. Trocar de módulo só evolui o CENTRO no lugar.
//
// `grid` (opcional) sobrescreve o gridTemplateColumns do shell para o módulo —
// ex.: o Paciente 360 usa uma ESQUERDA de largura fixa (sidebar do paciente)
// mantendo a Athena expansível na 3ª coluna.
export type ModuleGrid = { expanded: string; collapsed: string };

export type ModuleView = {
  Center: ComponentType<ScreenProps>;
  Left?: ComponentType<ScreenProps>;
  grid?: ModuleGrid;
};

export const MODULES: Record<string, ModuleView> = {
  home: { Center: HomeCenter },
  // Agenda — coluna única; mini-calendário e alertas vivem DENTRO da tela.
  agenda: { Center: AgendaCenter },
  messages: { Center: MessagesCenter, Left: MessagesLeft },
  // Pacientes (lista) — coluna única; a sidebar de filtros vive DENTRO da tela.
  patients: { Center: PatientsCenter },
  // Paciente 360 — coluna ÚNICA centralizada (novo look do Figma). Sem `Left`: o
  // shell renderiza em coluna única e a Athena vira overlay/orbe acionável.
  "pre-review": { Center: PreReviewCenter },
  // Acompanhamento (Kanban) — unifica pré e pós-consulta. Coluna única.
  acompanhamento: { Center: AcompanhamentoCenter },
  // Casuística — página única analítica.
  casuistry: { Center: CasuistryCenter },
  // Documentos (Documents Studio) — coluna única.
  documents: { Center: DocumentsCenter },
  "consult-intro": { Center: ConsultIntroCenter },
  // Consulta ao Vivo — tela autocontida de 2 zonas (main + aside Athena própria).
  consult: { Center: ConsultCenter },
  "clinical-note": { Center: ClinicalNoteCenter, Left: ClinicalNoteLeft },
};
