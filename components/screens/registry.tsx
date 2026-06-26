import type { ComponentType } from "react";
import type { ScreenProps } from "./index";
import { HomeCenter } from "./HomeScreen";
import { MessagesCenter, MessagesLeft } from "./MessagesScreen";
import { PatientsCenter, PatientsLeft } from "./PatientsScreen";
import { ConsultIntroCenter } from "./ConsultIntroScreen";
import { ConsultCenter, ConsultLeft } from "./ConsultScreen";
import { AgendaCenter, AgendaLeft } from "./AgendaScreen";
import { PreReviewCenter, PreReviewLeft } from "./PreReviewScreen";
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
  agenda: { Center: AgendaCenter, Left: AgendaLeft },
  messages: { Center: MessagesCenter, Left: MessagesLeft },
  patients: { Center: PatientsCenter, Left: PatientsLeft },
  "pre-review": {
    Center: PreReviewCenter,
    Left: PreReviewLeft,
    // Sidebar do paciente com largura fixa (~311px no Figma); a Athena segue
    // expansível (3ª coluna) sem comprimir a sidebar.
    grid: {
      collapsed: "311px minmax(0,1fr)",
      expanded: "311px minmax(0,2.2fr) minmax(0,1fr)",
    },
  },
  "consult-intro": { Center: ConsultIntroCenter },
  consult: { Center: ConsultCenter, Left: ConsultLeft },
  "clinical-note": { Center: ClinicalNoteCenter, Left: ClinicalNoteLeft },
};
