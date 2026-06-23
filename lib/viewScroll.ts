// Canal compartilhado entre o scroll da tela (JourneyShell) e o mundo 3D
// (CameraRig faz o pan vertical; AiGlobe sobe a orb). É um ref simples — sem
// React, sem re-render — no mesmo espírito do proxyRef da câmera. `progress` ∈
// [0,1]: 0 = topo do prontuário, 1 = base. Resetado a 0 ao sair da tela.
export const viewScroll = { progress: 0 };
