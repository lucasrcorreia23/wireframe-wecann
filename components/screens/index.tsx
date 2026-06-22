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
import { PrescriptionScreen } from "./PrescriptionScreen";
import { ReinforcedConfirmScreen } from "./ReinforcedConfirmScreen";
import { ClosureScreen } from "./ClosureScreen";
import { ClinicalSafetyScreen } from "./ClinicalSafetyScreen";
import { ImmediateContactScreen } from "./ImmediateContactScreen";
import { PrescriptionRenewalScreen } from "./PrescriptionRenewalScreen";
import { ClinicalDoubtsReportsScreen } from "./ClinicalDoubtsReportsScreen";
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
  PrescriptionScreen,
  ReinforcedConfirmScreen,
  ClosureScreen,
  ClinicalSafetyScreen,
  ImmediateContactScreen,
  PrescriptionRenewalScreen,
  ClinicalDoubtsReportsScreen,
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
  prescription: PrescriptionScreen,
  "reinforced-confirm": ReinforcedConfirmScreen,
  closure: ClosureScreen,
  "clinical-safety": ClinicalSafetyScreen,
  "immediate-contact": ImmediateContactScreen,
  "prescription-renewal": PrescriptionRenewalScreen,
  "clinical-doubts-reports": ClinicalDoubtsReportsScreen,
  casuistry: CasuistryScreen,
  report: ReportScreen,
};
