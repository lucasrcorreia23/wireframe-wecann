"use client";

import { useEffect, useReducer, useRef } from "react";
import { useFlow } from "@/flow/store";
import { gsap, useGSAP, Flip } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { HOME_GAP, HOME_SIDEBAR_W } from "@/lib/homeLayout";
import { homeChat } from "@/lib/homeChat";
import { PromptBox } from "@/components/home/PromptBox";
import { HomeSidebar } from "@/components/home/HomeSidebar";
import { ChatSession } from "@/components/home/ChatSession";
import type { Patient } from "@/lib/patients";
import type { Turn } from "@/components/home/chatData";

const SUGGESTIONS = [
  "Suporte à Decisão Clínica",
  "Documentação",
  "Calculadoras",
  "Diretrizes",
  "Segurança de Medicamentos",
  "E mais",
];

// ───────── Máquina de estados do chat (local à Home) ─────────
// turns [] = idle. SEND APENDA um turno (transcript multi-turno); NEW_SESSION
// (clique numa Sessão Recente) zera o transcript com 1 turno; ANSWER vira a
// fase de UM turno (guardado por id — mata race de timers); RESET (plus /
// aba Home / logo) volta ao idle. Navegar para outra tab desmonta a tela →
// o chat reseta ao voltar (por design).
type ChatState = {
  turns: Turn[];
  session: number; // re-keia o transcript a cada sessão nova
  nextId: number;
  /** Paciente fixado ("Discutir um caso") — escopa a sessão; parte do ciclo de
   *  vida dela (RESET/NEW_SESSION limpam, SEND mantém). */
  patient: Patient | null;
};

type ChatEvent =
  | { type: "SEND"; question: string }
  | { type: "NEW_SESSION"; question: string }
  | { type: "ANSWER"; turnId: number }
  | { type: "PIN"; patient: Patient | null }
  | { type: "RESET" };

function chatReducer(s: ChatState, e: ChatEvent): ChatState {
  switch (e.type) {
    case "SEND": {
      // Turno anterior ainda "asking" é encerrado AQUI (a resposta dele monta
      // estática — sem status órfã ciclando quando o timer for limpo).
      const settled = s.turns.map((t) =>
        t.phase === "asking" ? { ...t, phase: "answered" as const } : t,
      );
      return {
        ...s,
        turns: [
          ...settled,
          { id: s.nextId, question: e.question, phase: "asking" },
        ],
        nextId: s.nextId + 1,
      };
    }
    case "NEW_SESSION":
      // Sessão recente = sem paciente (escopo genérico).
      return {
        turns: [{ id: s.nextId, question: e.question, phase: "asking" }],
        session: s.session + 1,
        nextId: s.nextId + 1,
        patient: null,
      };
    case "ANSWER":
      return {
        ...s,
        turns: s.turns.map((t) =>
          t.id === e.turnId && t.phase === "asking"
            ? { ...t, phase: "answered" as const }
            : t,
        ),
      };
    case "PIN":
      return { ...s, patient: e.patient };
    case "RESET":
      return {
        turns: [],
        session: s.session + 1,
        nextId: s.nextId,
        patient: null,
      };
  }
}

// Home — estado IDLE: orb à esquerda + saudação, prompt + sugestões; sidebar
// com Pílulas/Agenda/Sessões. Ao ENVIAR uma pergunta vira o modo SESSÃO
// (mocks 0-174/0-279/0-459): a orb desliza para o canto da pergunta, a
// sidebar vira SÓ a lista de Sessões Recentes (Flip), a aba Home desmarca e
// o prompt complementar fixa no rodapé. Da 2ª pergunta em diante o
// transcript empilha e a pergunta do topo SOLTA (rola junto).
export function HomeScreen() {
  const introPhase = useFlow((s) => s.introPhase);
  const setHomeChatActive = useFlow((s) => s.setHomeChatActive);
  const homeChatResetToken = useFlow((s) => s.homeChatResetToken);
  const rootRef = useRef<HTMLDivElement>(null);
  const flipSnapshot = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const [chat, dispatch] = useReducer(chatReducer, {
    turns: [],
    session: 0,
    nextId: 1,
    patient: null,
  });

  // Fluxo "Discutir um caso": o paciente fixado vive no reducer (chat.patient);
  // a busca/dropdown vivem dentro do PromptBox.

  const collapsed = chat.turns.length > 0;
  const lastTurn = chat.turns[chat.turns.length - 1];
  const introHidden = introPhase === "text" || introPhase === "globe";

  // Espelha a fase no canal 3D (AiGlobe lê por frame) — a âncora só é zerada
  // no idle (zerar no handoff entre turnos faria a orb pular pro fallback).
  useEffect(() => {
    homeChat.phase = lastTurn?.phase ?? "idle";
    if (!lastTurn) {
      homeChat.anchorX = 0;
      homeChat.anchorY = 0;
      homeChat.anchorAlpha = 1;
    }
  }, [lastTurn]);

  // Flag reativa p/ TopBar (desmarca a aba Home) + limpeza no unmount.
  useEffect(() => {
    setHomeChatActive(collapsed);
  }, [collapsed, setHomeChatActive]);
  useEffect(
    () => () => {
      setHomeChatActive(false);
      homeChat.phase = "idle";
      homeChat.anchorX = 0;
      homeChat.anchorY = 0;
      homeChat.anchorAlpha = 1;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Clicar na aba Home (ou no logo) com o chat ativo → reset para o idle.
  const resetTokenRef = useRef(homeChatResetToken);
  useEffect(() => {
    if (homeChatResetToken === resetTokenRef.current) return;
    resetTokenRef.current = homeChatResetToken;
    captureFlip(); // o DOM ainda mostra o chat — snapshot válido p/ o Flip
    dispatch({ type: "RESET" });
  }, [homeChatResetToken]);

  const send = (question: string) => {
    if (chat.turns.length === 0) {
      if (introPhase !== "ready") return; // não briga com a intro
      captureFlip(); // só a transição idle→chat anima via Flip
    }
    dispatch({ type: "SEND", question });
  };

  const startSession = (question: string) => {
    if (chat.turns.length === 0) {
      if (introPhase !== "ready") return;
      captureFlip();
    }
    dispatch({ type: "NEW_SESSION", question });
  };

  const reset = () => {
    captureFlip();
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

  // Transição idle⇄chat: a sidebar reorganiza via Flip a partir do snapshot
  // capturado no handler. Pílulas/Agenda ficam montadas com `hidden` no modo
  // chat — entram/saem por fade orquestrado pelo próprio Flip.
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
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { opacity: 0 },
            { opacity: 1, duration: 0.25, delay: 0.1, ease: "power2.out" },
          ),
        onLeave: (els) =>
          gsap.fromTo(
            els,
            { opacity: 1 },
            { opacity: 0, duration: 0.25, ease: "power2.out" },
          ),
      });
      flipSnapshot.current = null;
    },
    { dependencies: [collapsed], scope: rootRef },
  );

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
      {/* ───── Coluna principal (transparente — a bola fica visível atrás) ─────
          No chat o padding inferior encolhe: o prompt fixa no LIMITE da tela. */}
      <div
        className={cn(
          "orbit-pane flex min-h-0 flex-col",
          collapsed ? "pb-3" : "pb-8",
        )}
      >
        {!collapsed ? (
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

            {/* Prompt + tópicos. */}
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
                onPinPatient={(p) => dispatch({ type: "PIN", patient: p })}
                pinnedPatient={chat.patient}
                onUnpin={() => dispatch({ type: "PIN", patient: null })}
              />

              <div className="flex w-max max-w-none flex-nowrap items-center justify-center gap-4">
                {SUGGESTIONS.map((text) => (
                  <span
                    key={text}
                    className="brand-underline inline-flex rounded-full pb-px"
                  >
                    {/* Clicar num tópico TAMBÉM inicia a interação. */}
                    <button
                      onClick={() => send(text)}
                      className="rounded-full bg-white px-3 pt-2 pb-[9px] text-center text-[12px] font-medium leading-[1.4] text-ink transition-colors hover:text-neutral-600"
                    >
                      {text}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <ChatSession
            turns={chat.turns}
            session={chat.session}
            onSend={send}
            onAnswered={(turnId) => dispatch({ type: "ANSWER", turnId })}
            patient={chat.patient}
          />
        )}
      </div>

      {/* ───── Sidebar (no chat vira SÓ a lista de Sessões, sempre visível) ───── */}
      <HomeSidebar
        collapsed={collapsed}
        introHidden={introHidden}
        onNewSession={reset}
        onAskSession={startSession}
        pinnedPatient={chat.patient}
        pinnedQuestion={chat.turns[0]?.question}
      />
    </div>
  );
}
