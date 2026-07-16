"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { QuestionPill } from "./QuestionPill";
import { ChatTurn } from "./ChatTurn";
import { PromptBox } from "./PromptBox";
import type { Patient } from "@/lib/patients";
import { CHAT_PLACEHOLDER, type Turn } from "./chatData";

// Orquestrador da sessão de chat multi-turno. Scroller PRÓPRIO — não alimenta
// viewScroll (o globo pertence à pill, não sobe com o scroll do prontuário).
// Com 1 turno a pill fica FIXA fora do scroller (layout do mock 0-174) com o
// globo parado no canto; da 2ª pergunta em diante ela SOLTA: todos os turnos
// empilham no transcript e rolam juntos — o globo segue a pill mais nova e
// DISSOLVE nas zonas de fade (nunca passa por cima do header). Quem acompanha a
// GERAÇÃO é a marquinha da StatusLine (ver ChatTurn), que desce pela canaleta
// junto do texto. O auto-scroll leva a pergunta nova ao topo da área visível. O
// prompt "Complemente..." vive FIXO no rodapé (fora do scroller) — o conteúdo
// dissolve nele pela máscara inferior.
export function ChatSession({
  turns,
  session,
  onSend,
  onAnswered,
  patient,
}: {
  turns: Turn[];
  session: number;
  onSend: (question: string) => void;
  onAnswered: (turnId: number) => void;
  patient?: Patient | null;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduce = useMemo(() => prefersReducedMotion(), []);
  // Máscara de esvanecimento no topo do scroller — só quando há scroll (em
  // repouso a pill fica nítida no topo).
  const [masked, setMasked] = useState(false);

  const lastTurn = turns[turns.length - 1];
  const single = turns.length === 1;

  // Loading mock: o ÚLTIMO turno "responde" após ~3 ciclos de status. Turnos
  // supersedidos já foram force-answered pelo reducer (sem timer órfão).
  useEffect(() => {
    if (!lastTurn || lastTurn.phase !== "asking") return;
    const id = lastTurn.id;
    const t = setTimeout(() => onAnswered(id), reduce ? 1200 : 4800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTurn?.id, lastTurn?.phase, reduce]);

  // Sessão nova (clique em Sessões Recentes): volta ao topo — o próprio
  // evento de scroll desliga a máscara superior (onScroll → setMasked).
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [session]);

  // Turno novo: spacer de altura no último turno (garante que a pill nova
  // alcança o topo), auto-scroll até ela e entrada da pill + status.
  useGSAP(
    () => {
      const scroller = scrollRef.current;
      if (!scroller || !lastTurn) return;

      const turnEls = scroller.querySelectorAll<HTMLElement>("[data-turn]");
      const lastEl = turnEls[turnEls.length - 1];
      if (!lastEl) return;

      // Só o último turno carrega o minHeight — limpa os anteriores para não
      // acumular vãos entre turnos.
      turnEls.forEach((el) => (el.style.minHeight = ""));

      if (turns.length > 1) {
        lastEl.style.minHeight = `${scroller.clientHeight - 8}px`;
        const target =
          lastEl.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop -
          8;
        if (reduce) {
          scroller.scrollTop = target;
        } else {
          gsap.to(scroller, {
            scrollTop: target,
            duration: 0.6,
            ease: "power2.out",
            overwrite: "auto", // SENDs em sequência não brigam pelo scroll
          });
        }
      }

      if (!reduce) {
        // 1 turno: anima pill fixa (fora do scroller) + status; 2+: só o
        // turno recém-apendado (os anteriores ficam parados no fluxo).
        const targets = single
          ? rootRef.current!.querySelectorAll(".chat-intro")
          : lastEl.querySelectorAll(".chat-intro");
        gsap.fromTo(
          targets,
          { opacity: 0, y: -8 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, ease: "power2.out" },
        );
      }
    },
    { dependencies: [lastTurn?.id], scope: rootRef },
  );

  // Topo gateado pelo scroll (comportamento original) + base sempre ativa
  // (o conteúdo dissolve no prompt fixo — mesma receita do aside).
  const mask = `linear-gradient(to bottom, ${
    masked ? "transparent 0px, black 64px" : "black 0px"
  }, black calc(100% - 56px), transparent 100%)`;

  return (
    // pt-20 = respiro do mock (a pill não cola no header). No modo 1 turno a
    // pill vive FORA do scroller (fixa por natureza, entorno transparente
    // para o brilho da orb); o conteúdo rola abaixo dela e ESVANECE na
    // aproximação (mask).
    <div ref={rootRef} className="relative flex min-h-0 flex-1 flex-col pt-20">
      {single && (
        <div className="chat-intro z-10 mx-auto w-full max-w-[768px]">
          <QuestionPill text={lastTurn.question} active />
        </div>
      )}

      <div
        ref={scrollRef}
        data-chat-scroll
        onScroll={(e) => setMasked(e.currentTarget.scrollTop > 4)}
        className={cn(
          "no-scrollbar min-h-0 flex-1 overflow-y-auto",
          // O mt-2 (gap pill→status) migra para dentro do turno quando a pill
          // entra no fluxo — o scroller cresce para cima SEM o conteúdo pular.
          single && "mt-2",
        )}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        <div
          key={session}
          className="mx-auto flex w-full max-w-[768px] flex-col gap-8 pb-6"
        >
          {turns.map((turn) => (
            <ChatTurn
              key={turn.id}
              turn={turn}
              showPill={!single}
              isLast={turn.id === lastTurn?.id}
              onSend={onSend}
              patient={patient}
            />
          ))}
        </div>
      </div>

      {/* Prompt FIXO no limite inferior da tela (fora do scroller) — o
          contexto da conversa nunca some atrás do teclado de perguntas. */}
      <div className="mx-auto w-full max-w-[768px] pt-3">
        <PromptBox placeholder={CHAT_PLACEHOLDER} onSend={onSend} />
      </div>
    </div>
  );
}
