"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { useFlow } from "@/flow/store";
import { gsap, useGSAP, Flip } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { HOME_GAP, HOME_SIDEBAR_W } from "@/lib/homeLayout";
import { homeChat } from "@/lib/homeChat";
import { PromptBox } from "@/components/home/PromptBox";
import { HomeSidebar } from "@/components/home/HomeSidebar";
import { ChatSession } from "@/components/home/ChatSession";

const SUGGESTIONS = [
  "Perguntar sobre evidencias primárias",
  "Pergunte sobre tratamento de doenças",
  "Perguntar sobre efeitos colaterais de drogas",
];

// ───────── Máquina de estados do chat (local à Home) ─────────
// idle → asking (SEND) → answered (ANSWER); SEND em qualquer fase SUBSTITUI a
// Q&A (sempre uma por vez); RESET (plus das Sessões) volta ao idle. Navegar
// para outra tab desmonta a tela → o chat reseta ao voltar (por design).
type ChatState = {
  phase: "idle" | "asking" | "answered";
  question: string;
  session: number; // re-keia timers/streaming a cada pergunta
};

type ChatEvent =
  | { type: "SEND"; question: string }
  | { type: "ANSWER" }
  | { type: "RESET" };

function chatReducer(s: ChatState, e: ChatEvent): ChatState {
  switch (e.type) {
    case "SEND":
      return { phase: "asking", question: e.question, session: s.session + 1 };
    case "ANSWER":
      return s.phase === "asking" ? { ...s, phase: "answered" } : s;
    case "RESET":
      return { phase: "idle", question: "", session: s.session };
  }
}

// Home — estado IDLE: orb à esquerda + saudação, prompt + sugestões; sidebar
// com Pílulas/Agenda/Sessões. Ao ENVIAR uma pergunta vira o modo CHAT (mocks
// 0-174/0-279/0-459): a orb desliza para o canto da mensagem fixada, os cards
// recolhem (Flip) e as Sessões viram o card principal; a resposta chega em
// streaming com Referências e Continue. A sidebar sai ao rolar o conteúdo e
// volta no topo (histerese).
export function HomeScreen() {
  const introPhase = useFlow((s) => s.introPhase);
  const rootRef = useRef<HTMLDivElement>(null);
  const flipSnapshot = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const [chat, dispatch] = useReducer(chatReducer, {
    phase: "idle",
    question: "",
    session: 0,
  });
  const [sidebarAway, setSidebarAway] = useState(false);

  const introHidden = introPhase === "text" || introPhase === "globe";

  // Espelha a fase no canal 3D (AiGlobe lê por frame) + reset no unmount.
  useEffect(() => {
    homeChat.phase = chat.phase;
  }, [chat.phase]);
  useEffect(
    () => () => {
      homeChat.phase = "idle";
      homeChat.anchorX = 0;
      homeChat.anchorY = 0;
    },
    [],
  );

  // Captura o estado dos [data-flip] ANTES do re-render (padrão
  // CompanionPanels) — o useGSAP abaixo anima do snapshot para o novo layout.
  const captureFlip = () => {
    if (!rootRef.current) return;
    flipSnapshot.current = Flip.getState(
      rootRef.current.querySelectorAll("[data-flip]"),
    );
  };

  const send = (question: string) => {
    if (chat.phase === "idle" && introPhase !== "ready") return; // não briga com a intro
    captureFlip();
    setSidebarAway(false);
    dispatch({ type: "SEND", question });
  };

  const reset = () => {
    captureFlip();
    setSidebarAway(false);
    dispatch({ type: "RESET" });
  };

  // Intro: stagger dos módulos + saudação por último (inalterado).
  useGSAP(
    () => {
      if (introPhase !== "modules") return;
      const tl = gsap.timeline();
      tl.fromTo(
        ".home-module",
        { opacity: 0 },
        { opacity: 1, duration: 0.6, stagger: 0.12, ease: "power2.out" },
      );
      tl.fromTo(
        ".home-greeting",
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out" },
        ">-0.3",
      );
    },
    { dependencies: [introPhase], scope: rootRef },
  );

  // Transição idle⇄chat: os cards da sidebar recolhem/expandem via Flip a
  // partir do snapshot capturado no handler.
  useGSAP(
    () => {
      if (!flipSnapshot.current) return;
      Flip.from(flipSnapshot.current, {
        targets: "[data-flip]",
        duration: 0.42,
        ease: "power2.out",
        absolute: true,
        nested: true,
        fade: true,
      });
      flipSnapshot.current = null;
    },
    { dependencies: [chat.phase], scope: rootRef },
  );

  // Sidebar sai/volta (modo answered, dirigida pelo scroll do conteúdo).
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const aside = root.querySelector("[data-chat-aside]");
      if (!aside) return;
      if (sidebarAway) {
        gsap.to(aside, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
          pointerEvents: "none",
        });
        gsap.to(root, {
          "--sb-w": "0px",
          "--sb-gap": "0px",
          duration: 0.5,
          ease: "power2.inOut",
        });
      } else {
        gsap.to(root, {
          "--sb-w": `${HOME_SIDEBAR_W}px`,
          "--sb-gap": `${HOME_GAP}px`,
          duration: 0.5,
          ease: "power2.inOut",
        });
        gsap.to(aside, {
          opacity: 1,
          duration: 0.3,
          delay: 0.15,
          ease: "power2.out",
          pointerEvents: "auto",
        });
      }
    },
    { dependencies: [sidebarAway], scope: rootRef },
  );

  // Histerese do scroll (só no answered): >80px esconde, <24px mostra.
  const onScrollDepth = (top: number) => {
    if (chat.phase !== "answered") return;
    if (top > 80) setSidebarAway(true);
    else if (top < 24) setSidebarAway(false);
  };

  return (
    <div
      ref={rootRef}
      className="grid h-screen w-full pt-24"
      style={
        {
          gridTemplateColumns: "minmax(0,1fr) var(--sb-w)",
          columnGap: "var(--sb-gap)",
          "--sb-w": `${HOME_SIDEBAR_W}px`,
          "--sb-gap": `${HOME_GAP}px`,
        } as React.CSSProperties
      }
    >
      {/* ───── Coluna principal (transparente — a bola fica visível atrás) ───── */}
      <div className="orbit-pane flex min-h-0 flex-col pb-8">
        {chat.phase === "idle" ? (
          <>
            {/* Área flexível: orb à ESQUERDA e saudação à direita dela. */}
            <header
              className={cn(
                "home-greeting flex flex-1 items-center",
                introHidden && "opacity-0",
              )}
            >
              <div aria-hidden className="w-1/2" />
              <div className="flex flex-col gap-1">
                <h1 className="font-display text-[28px] font-semibold leading-[1.2] text-ink">
                  Boa tarde, Dr. Ricardo
                </h1>
                <p className="text-[14px] leading-[1.6] text-secondary">
                  Quinta, 19 de junho 14:02
                </p>
              </div>
            </header>

            {/* Prompt + sugestões + explorar. */}
            <div
              className={cn(
                "home-module flex w-full flex-col items-center gap-4 px-12",
                introHidden && "opacity-0",
              )}
            >
              <PromptBox
                placeholder="Digite sua pergunta ou comando..."
                onSend={send}
                disabled={introPhase !== "ready"}
              />

              <div className="flex flex-col items-center gap-3">
                <div className="flex w-max max-w-none flex-nowrap items-center justify-center gap-4">
                  {SUGGESTIONS.map((text) => (
                    <span
                      key={text}
                      className="brand-underline inline-flex rounded-full pb-px"
                    >
                      {/* Clicar numa sugestão TAMBÉM inicia a interação. */}
                      <button
                        onClick={() => send(text)}
                        className="rounded-full bg-white px-3 pt-2 pb-[9px] text-center text-[12px] font-medium leading-[1.4] text-ink transition-colors hover:text-neutral-600"
                      >
                        {text}
                      </button>
                    </span>
                  ))}
                </div>

                <button className="flex items-center gap-2 rounded-full py-2 pr-3 pl-4 text-[12px] font-medium leading-[1.4] text-secondary transition-colors hover:text-ink">
                  Explorar mais capacidades
                  <img
                    src="/figma/icon-chevron-down.svg"
                    alt=""
                    className="size-6"
                  />
                </button>
              </div>
            </div>
          </>
        ) : (
          <ChatSession
            question={chat.question}
            phase={chat.phase}
            session={chat.session}
            onSend={send}
            onAnswered={() => dispatch({ type: "ANSWER" })}
            onScrollDepth={onScrollDepth}
          />
        )}
      </div>

      {/* ───── Sidebar (recolhe no chat; sai/volta pelo scroll no answered) ───── */}
      <HomeSidebar
        collapsed={chat.phase !== "idle"}
        introHidden={introHidden}
        onNewSession={reset}
        onAskSession={send}
      />
    </div>
  );
}
