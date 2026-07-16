"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { PinnedQuestion } from "./PinnedQuestion";
import { StatusLine } from "./StatusLine";
import { AnswerStream } from "./AnswerStream";
import { PromptBox } from "./PromptBox";
import { CHAT_PLACEHOLDER } from "./chatData";

// Orquestrador da sessão de chat (fases asking/answered). Scroller PRÓPRIO —
// não alimenta viewScroll (a orb pertence à pill, não sobe com o scroll). A
// pill fica sticky no topo com um scrim que dissolve o conteúdo ao passar por
// baixo; o prompt vive no FIM do fluxo (mt-auto cobre o mock curto e o longo).
export function ChatSession({
  question,
  phase,
  session,
  onSend,
  onAnswered,
  onScrollDepth,
}: {
  question: string;
  phase: "asking" | "answered";
  session: number;
  onSend: (question: string) => void;
  onAnswered: () => void;
  onScrollDepth: (top: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduce = useMemo(() => prefersReducedMotion(), []);
  const [bodyOpen, setBodyOpen] = useState(true);
  // Máscara de esvanecimento no topo do scroller — só quando há scroll (em
  // repouso o status fica nítido a 8px da pill).
  const [masked, setMasked] = useState(false);

  // Loading mock: após ~3 ciclos de status, "gera" a resposta.
  useEffect(() => {
    if (phase !== "asking") return;
    const t = setTimeout(onAnswered, reduce ? 1200 : 4800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, session, reduce]);

  // Nova pergunta: volta ao topo (a sidebar reaparece pela histerese) e o
  // corpo volta aberto.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    onScrollDepth(0);
    setBodyOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Entrada da pill + status (opacidade em folhas; re-keyado por pergunta).
  useGSAP(
    () => {
      if (reduce) return;
      gsap.fromTo(
        ".chat-intro",
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, ease: "power2.out" },
      );
    },
    { dependencies: [session], scope: rootRef },
  );

  const handleScroll = (top: number) => {
    onScrollDepth(top);
    setMasked(top > 4);
  };

  return (
    // pt-20 = respiro do mock (a pill não cola no header). A pill vive FORA
    // do scroller (fixa por natureza, entorno transparente para o brilho da
    // orb); o conteúdo rola abaixo dela e ESVANECE na aproximação (mask).
    <div ref={rootRef} className="relative flex min-h-0 flex-1 flex-col pt-20">
      <div className="chat-intro z-10 mx-auto w-full max-w-[768px]">
        <PinnedQuestion text={question} />
      </div>

      <div
        ref={scrollRef}
        onScroll={(e) => handleScroll(e.currentTarget.scrollTop)}
        className="no-scrollbar mt-2 min-h-0 flex-1 overflow-y-auto"
        style={
          masked
            ? {
                maskImage:
                  "linear-gradient(to bottom, transparent 0px, black 64px)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0px, black 64px)",
              }
            : undefined
        }
      >
        <div className="mx-auto flex min-h-full w-full max-w-[768px] flex-col">
          <StatusLine
            className="chat-intro"
            phase={phase}
            session={session}
            bodyOpen={bodyOpen}
            onToggle={() => setBodyOpen((o) => !o)}
          />

          {phase === "answered" && (
            <div key={session}>
              <AnswerStream bodyOpen={bodyOpen} onFollowUp={onSend} />
            </div>
          )}

          {/* Prompt no fim do fluxo: encosta na base quando o conteúdo é
              curto (mt-auto), rola junto quando é longo. */}
          <div className="mt-auto pt-8 pb-2">
            <PromptBox placeholder={CHAT_PLACEHOLDER} onSend={onSend} />
          </div>
        </div>
      </div>
    </div>
  );
}
