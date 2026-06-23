"use client";

import { useMemo, useRef, useState } from "react";
import { SCREENS, type ScreenProps } from "@/components/screens";
import { useFlow } from "@/flow/store";
import { NODES } from "@/flow/graph";
import type { NodeId } from "@/flow/types";
import { WireButton } from "@/components/ui";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/cn";

// Telas que adotam o layout modular (módulos flutuam sobre o mundo 3D, sem o
// card fosco único). As demais mantêm o card fosco contido.
const MODULAR = new Set<string>([
  "home",
  "agenda",
  "messages",
  "patients",
  "utilities",
  "pre-review",
  "consult",
  "clinical-note",
  "report",
  "casuistry",
]);

// Telas-destino do menu: são pontos de partida (não passos de um fluxo linear),
// então NÃO recebem a barra "Continuar → próxima". A maioria já é modular; a
// casuística é a única não-modular do conjunto.
const MENU_DESTINATIONS = new Set<string>([
  "home",
  "agenda",
  "messages",
  "patients",
  "casuistry",
  "utilities",
]);

/** Resolve o ease "travel" com fallback documentado (power3.inOut). */
function travelEase(): string {
  return gsap.parseEase(EASE.travel) ? EASE.travel : EASE.travelFallback;
}

// Overlay DOM 1:1 da estação ativa — nítido, centralizado, acima do canvas. O
// mundo 3D (globo + atmosfera) fica quase parado atrás; quem se move agora são
// AS TELAS: na transição, a entrante chega numa diagonal lateral+fundo
// circundando a orb e a que sai segue na diagonal oposta. O transform vive só no
// wrapper de órbita e é limpo ao assentar (clearProps) — em repouso nenhum
// ancestral tem transform, então o backdrop-filter dos módulos volta a "pegar" o
// globo (blur intacto). Durante o voo o blur fica suspenso, mas os panes estão
// fora do centro, sobre o fundo — readquirem o vidro exatamente ao chegar.
export function ActiveStationLayer() {
  const currentNode = useFlow((s) => s.currentNode);
  const travelToken = useFlow((s) => s.travelToken);
  const goTo = useFlow((s) => s.goTo);
  const reduce = useMemo(() => prefersReducedMotion(), []);

  const stageRef = useRef<HTMLDivElement>(null);
  // Tela que SAI durante a transição (null em repouso) + direção da diagonal.
  const [exiting, setExiting] = useState<{ node: NodeId; dir: number } | null>(null);
  const [seenToken, setSeenToken] = useState(0);

  // Ajuste de estado DURANTE o render (padrão React, sem efeito): ao mudar o
  // travelToken capturamos a tela anterior e a direção (forward=+1 / back=−1)
  // para orientar a diagonal. Sob reduced-motion não há órbita — troca
  // instantânea + fade do CSS no remount.
  if (travelToken !== seenToken) {
    setSeenToken(travelToken);
    const { prevNode, lastNav } = useFlow.getState();
    setExiting(
      !reduce && travelToken !== 0 && prevNode && prevNode !== currentNode
        ? { node: prevNode, dir: lastNav === "back" ? -1 : 1 }
        : null,
    );
  }

  // Timeline de órbita: roda quando `exiting` está setado (ambas as telas no
  // DOM). A entrante chega da diagonal lateral+fundo até a identidade (centro); a
  // que sai recua na diagonal oposta. clearProps no fim devolve transform/opacity
  // ao zero — repouso sem transform em ancestral => blur modular intacto.
  useGSAP(
    () => {
      if (!exiting) return;
      const stage = stageRef.current;
      if (!stage) return;
      // Alvos = as COLUNAS de cada tela (.orbit-pane). Aplicamos o MESMO
      // deslocamento em px a todas → desliza como um bloco rígido. O transform
      // vai no próprio elemento de vidro (ou em coluna não-vidro), nunca num
      // ancestral do vidro central → o backdrop-filter fica vivo durante o voo.
      const inEls = stage.querySelectorAll<HTMLElement>('[data-orbit="in"] .orbit-pane');
      const outEls = stage.querySelectorAll<HTMLElement>('[data-orbit="out"] .orbit-pane');
      if (inEls.length === 0 || outEls.length === 0) {
        setExiting(null);
        return;
      }
      const dir = exiting.dir;
      const all = [...inEls, ...outEls];
      // px funcional (mesmo valor p/ todas as colunas → bloco rígido). Amplo:
      // começa inteiramente fora da viewport, na diagonal.
      const vw = () => window.innerWidth;
      const vh = () => window.innerHeight;

      gsap.set(all, { willChange: "transform" });
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(all, { clearProps: "transform,opacity,willChange" });
          setExiting(null);
        },
      });
      // Que SAI — o MOVIMENTO continua junto com a que entra (desliza a diagonal
      // OPOSTA inteira, encolhendo) durante todo o travel*0.8.
      tl.to(
        outEls,
        {
          x: () => -1.1 * vw() * dir,
          y: () => 0.42 * vh(),
          scale: 0.97,
          duration: DURATION.travel * 0.8,
          ease: "power2.in",
        },
        0,
      );
      // ...com o FADE ADIANTADO (~travel*0.45): a que sai já está sumida quando a
      // que entra chega ao centro → sem sobreposição de duas telas nítidas. (Sem
      // `filter: blur` aqui: animar filter sobre vidro/canvas causava o flicker.)
      tl.to(
        outEls,
        {
          opacity: 0,
          duration: DURATION.travel * 0.45,
          ease: "power2.in",
        },
        0,
      );
      // Entra inteira de fora (canto), deslizando na diagonal até a identidade e
      // EMERGINDO de uma escala leve (1.02 → 1) — SEM opacity/blur (entra nítida;
      // o movimento é que faz a tela aparecer).
      tl.fromTo(
        inEls,
        { x: () => 1.15 * vw() * dir, y: () => -0.45 * vh(), scale: 1.02 },
        {
          x: 0,
          y: 0,
          scale: 1,
          duration: DURATION.travel * 1.1,
          ease: travelEase(),
        },
        0.05,
      );
    },
    { dependencies: [exiting], scope: stageRef },
  );

  const renderScreen = (node: NodeId, role: "in" | "out") => {
    const n = NODES[node];
    const Screen = SCREENS[node];
    const isModular = MODULAR.has(node);

    // Liga forks/confirmação/avanço ao store (decisões resolvidas na própria tela).
    const props: ScreenProps = {};
    if (n.fork) {
      props.onYes = () => goTo(n.fork!.yes.to);
      props.onNo = () => goTo(n.fork!.no.to);
    }
    if (n.next) props.onContinue = () => goTo(n.next!);

    return (
      <div
        key={node}
        data-orbit={role}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className={cn(
            "station-sharp w-full max-w-[1240px]",
            role === "out" ? "pointer-events-none" : "pointer-events-auto",
            // Sob reduced-motion (sem órbita GSAP) um fade suave no remount.
            reduce && (isModular ? "station-fade" : "station-reveal"),
            isModular
              ? // SEM card no wrapper modular: o vidro dos módulos é que "pega" o
                // globo. Em repouso este wrapper é neutro (sem transform) para não
                // criar um backdrop-root e matar o blur dos filhos.
                "bg-transparent"
              : cn(
                  // O card É o elemento de vidro → recebe `orbit-pane` e o
                  // transform direto (fosco vivo durante o deslize).
                  "orbit-pane",
                  "overflow-hidden rounded-[40px] border border-white/50 bg-white/55",
                  "shadow-[0_8px_40px_rgba(0,0,0,0.06)] backdrop-blur-2xl",
                  "no-scrollbar max-h-[88vh] overflow-y-auto",
                ),
          )}
        >
          <Screen {...props} />

          {/* Avanço do caminho-ouro embutido na própria tela (sem barra flutuante).
              Telas modulares trazem seus próprios CTAs; forks resolvem na tela. */}
          {!isModular && n.next && !n.fork && !MENU_DESTINATIONS.has(node) ? (
            <div className="flex justify-end border-t border-neutral-200 bg-white/40 px-12 py-5">
              <WireButton variant="primary" onClick={() => goTo(n.next!)}>
                Continuar → {NODES[n.next].title}
              </WireButton>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const showExit = exiting !== null && exiting.node !== currentNode;

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center px-[3vw]">
      {/* Palco: ambas as telas ocupam a mesma caixa centralizada (absolute inset-0),
          empilhadas — a entrante por último (acima). Identidade = mesmos pixels de
          hoje (centralizado, max-w-[1240px]). */}
      <div ref={stageRef} className="relative h-full w-full">
        {showExit ? renderScreen(exiting!.node, "out") : null}
        {renderScreen(currentNode, "in")}
      </div>
    </div>
  );
}
