import type { ComponentType } from "react";
import { HomeCenter } from "./HomeScreen";
import { MessagesCenter } from "./MessagesScreen";
import { PatientsCenter } from "./PatientsScreen";
import { ConsultCenter } from "./ConsultScreen";
import { AnaliseCenter } from "./AnaliseScreen";

// Props que uma Screen pode receber. Forks usam onYes/onNo; a confirmação
// reforçada usa onConfirm/onCancel. Todas opcionais — ligadas ao store.
export type ScreenProps = {
  onYes?: () => void;
  onNo?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onContinue?: () => void;
  onGoHome?: () => void;
};

// Mapa id → componente CENTRAL da tela (usado pela galeria /gallery e pelo
// fallback mobile). A composição completa (esquerda · centro · direita) é feita
// pelo WorkspaceShell via o registry (components/screens/registry.tsx).
// Apenas os módulos ativos pós-reestruturação 2D. Os demais ficam DESATIVADOS
// (arquivos mantidos no disco para re-enable).
export const SCREENS: Record<string, ComponentType<ScreenProps>> = {
  home: HomeCenter,
  messages: MessagesCenter,
  patients: PatientsCenter,
  consult: ConsultCenter,
  analise: AnaliseCenter,
};
