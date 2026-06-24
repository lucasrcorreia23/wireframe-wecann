import type { ComponentType } from "react";
import type { ScreenProps } from "./index";
import { HomeCenter, HomeLeft } from "./HomeScreen";
import { MessagesCenter, MessagesLeft } from "./MessagesScreen";
import { PatientsCenter, PatientsLeft } from "./PatientsScreen";
import { ConsultCenter, ConsultLeft } from "./ConsultScreen";
import { AnaliseCenter, AnaliseLeft } from "./AnaliseScreen";

// Cada módulo fornece o conteúdo do CENTRO (foco) e, opcionalmente, da ESQUERDA
// (resumos alimentados pela IA). A coluna DIREITA é sempre o AthenaPanel
// persistente do WorkspaceShell. Trocar de módulo só evolui o CENTRO no lugar.
export type ModuleView = {
  Center: ComponentType<ScreenProps>;
  Left?: ComponentType<ScreenProps>;
};

export const MODULES: Record<string, ModuleView> = {
  home: { Center: HomeCenter, Left: HomeLeft },
  messages: { Center: MessagesCenter, Left: MessagesLeft },
  patients: { Center: PatientsCenter, Left: PatientsLeft },
  consult: { Center: ConsultCenter, Left: ConsultLeft },
  analise: { Center: AnaliseCenter, Left: AnaliseLeft },
};
