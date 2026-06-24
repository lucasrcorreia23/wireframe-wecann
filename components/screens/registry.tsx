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
export type ModuleView = {
  Center: ComponentType<ScreenProps>;
  Left?: ComponentType<ScreenProps>;
};

export const MODULES: Record<string, ModuleView> = {
  home: { Center: HomeCenter },
  agenda: { Center: AgendaCenter, Left: AgendaLeft },
  messages: { Center: MessagesCenter, Left: MessagesLeft },
  patients: { Center: PatientsCenter, Left: PatientsLeft },
  "pre-review": { Center: PreReviewCenter, Left: PreReviewLeft },
  "consult-intro": { Center: ConsultIntroCenter },
  consult: { Center: ConsultCenter, Left: ConsultLeft },
  "clinical-note": { Center: ClinicalNoteCenter, Left: ClinicalNoteLeft },
};
