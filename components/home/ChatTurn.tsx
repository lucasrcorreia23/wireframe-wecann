"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { prefersReducedMotion } from "@/lib/motion";
import type { Patient } from "@/lib/patients";
import {
  ANSWERED_STATUS_PATIENT,
  CHAT_STATUSES_PATIENT,
  type Turn,
} from "./chatData";
import { QuestionPill } from "./QuestionPill";
import { PatientChip } from "./PatientChip";
import { StatusLine } from "./StatusLine";
import { AnswerStream } from "./AnswerStream";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Um turno do transcript: pill da pergunta + status + resposta. `showPill` fica
// false no modo 1 turno (a pill vive FIXA fora do scroller, na ChatSession);
// com 2+ turnos cada pergunta entra no fluxo e rola junto. A pill (quando
// `active`) publica a âncora do GLOBO (que fica parado no canto dela).
//
// A MARQUINHA da StatusLine é que ACOMPANHA a geração: só no ÚLTIMO turno
// (isLast) um rAF mede a FRONTEIRA (último [data-answer-block] já revelado — a
// opacidade inline é escrita pelo GSAP do AnswerStream) e desliza o wrapper
// [data-mark-travel] até o centro da fronteira, na canaleta esquerda; sem bloco
// revelado (pensamento) a marca fica no slot, ao lado do copy. Medimos o SLOT
// (nunca transformado) como origem → o alvo é invariante a scroll/transform; o
// lerp harmônico dá o glide suave. O AnswerStream monta UMA vez quando o turno
// vira answered — se é o último (respondeu pelo timer) streama; se foi
// force-answered por uma pergunta supersedente, monta estático (stream=false).
export function ChatTurn({
  turn,
  showPill,
  isLast,
  onSend,
  patient,
}: {
  turn: Turn;
  showPill: boolean;
  isLast: boolean;
  onSend: (question: string) => void;
  patient?: Patient | null;
}) {
  const [bodyOpen, setBodyOpen] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduce = useMemo(() => prefersReducedMotion(), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!isLast || reduce || !root) return;
    let raf = 0;
    let last = 0;
    const cur = { x: 0, y: 0 };
    const loop = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
      last = t;
      const travel = root.querySelector<HTMLElement>("[data-mark-travel]");
      const slot = root.querySelector<HTMLElement>("[data-mark-slot]");
      if (travel && slot) {
        // Fronteira = último bloco de texto já revelado (varre em ordem, para
        // no primeiro ainda apagado).
        const blocks = root.querySelectorAll<HTMLElement>("[data-answer-block]");
        let frontier: HTMLElement | null = null;
        for (let i = 0; i < blocks.length; i++) {
          const b = blocks[i];
          const o = b.style.opacity === "" ? 1 : parseFloat(b.style.opacity);
          if (o > 0.02) frontier = b;
          else break;
        }
        let tx = 0;
        let ty = 0;
        if (frontier) {
          const sR = slot.getBoundingClientRect();
          const fR = frontier.getBoundingClientRect();
          const rootLeft = root.getBoundingClientRect().left;
          // Centro vertical da fronteira, mas NUNCA a menos de ~32px dos ícones
          // de ação (clamp) — a marca repousa acima deles, sem encostar.
          let centerY = fR.top + fR.height / 2;
          const actions = root.querySelector<HTMLElement>(
            "[data-answer-actions]",
          );
          if (actions) {
            const aTop = actions.getBoundingClientRect().top;
            centerY = Math.min(centerY, aTop - 36);
          }
          ty = centerY - (sR.top + sR.height / 2);
          // Canaleta ESQUERDA, ~32px à esquerda do texto (não sobrepõe): a
          // borda direita da marca fica 32px antes da coluna de texto.
          tx = rootLeft - 32 - sR.left;
        }
        const k = 1 - Math.pow(0.0015, dt);
        cur.x = lerp(cur.x, tx, k);
        cur.y = lerp(cur.y, ty, k);
        travel.style.transform = `translate(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      // Ao deixar de ser o último turno, a marca volta ao slot (inline).
      const travel = root.querySelector<HTMLElement>("[data-mark-travel]");
      if (travel) travel.style.transform = "";
    };
  }, [isLast, reduce]);

  return (
    <div ref={rootRef} data-turn className="flex flex-col">
      {showPill && (
        <div className="chat-intro">
          <QuestionPill text={turn.question} active={isLast} />
        </div>
      )}

      {patient ? (
        // Chat escopo de paciente: status à esquerda + chip do paciente à
        // direita, na mesma faixa (mock 0-174 do Paciente 360).
        <div
          className={cn(
            "chat-intro flex items-center justify-between gap-3",
            showPill && "mt-2",
          )}
        >
          <StatusLine
            phase={turn.phase}
            session={turn.id}
            bodyOpen={bodyOpen}
            onToggle={() => setBodyOpen((o) => !o)}
            statuses={CHAT_STATUSES_PATIENT}
            answeredStatus={ANSWERED_STATUS_PATIENT}
          />
          <PatientChip patient={patient} className="shrink-0" />
        </div>
      ) : (
        <StatusLine
          className={cn("chat-intro", showPill && "mt-2")}
          phase={turn.phase}
          session={turn.id}
          bodyOpen={bodyOpen}
          onToggle={() => setBodyOpen((o) => !o)}
        />
      )}

      {turn.phase === "answered" && (
        <AnswerStream bodyOpen={bodyOpen} onFollowUp={onSend} stream={isLast} />
      )}
    </div>
  );
}
