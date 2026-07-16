import type { ComponentType } from "react";
import { HomeScreen } from "./HomeScreen";
import { AgendaScreen } from "./AgendaScreen";
import { MessagesScreen } from "./MessagesScreen";
import { PatientsScreen } from "./PatientsScreen";
import { UtilitiesScreen } from "./UtilitiesScreen";
import { PreReviewScreen } from "./PreReviewScreen";
import { ClinicalQueueScreen } from "./ClinicalQueueScreen";
import { ConsultScreen } from "./ConsultScreen";
import { ClinicalNoteScreen } from "./ClinicalNoteScreen";
import { CasuistryScreen } from "./CasuistryScreen";
import { ReportScreen } from "./ReportScreen";

export {
  HomeScreen,
  AgendaScreen,
  MessagesScreen,
  PatientsScreen,
  UtilitiesScreen,
  PreReviewScreen,
  ClinicalQueueScreen,
  ConsultScreen,
  ClinicalNoteScreen,
  CasuistryScreen,
  ReportScreen,
};

// Props que uma Screen pode receber. Forks usam onYes/onNo; a confirmação
// reforçada usa onConfirm/onCancel. Todas opcionais — ligadas ao store na Fase 4.
export type ScreenProps = {
  onYes?: () => void;
  onNo?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onContinue?: () => void;
  onGoHome?: () => void;
};

// Mapa id → componente da tela. Os ids casam com os nós do flow/graph.ts.
export const SCREENS: Record<string, ComponentType<ScreenProps>> = {
  home: HomeScreen,
  agenda: AgendaScreen,
  messages: MessagesScreen,
  patients: PatientsScreen,
  utilities: UtilitiesScreen,
  "pre-review": PreReviewScreen,
  "clinical-queue": ClinicalQueueScreen,
  consult: ConsultScreen,
  "clinical-note": ClinicalNoteScreen,
  casuistry: CasuistryScreen,
  report: ReportScreen,
};
