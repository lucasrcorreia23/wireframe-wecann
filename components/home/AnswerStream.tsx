"use client";

import { useMemo, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { ANSWER_BLOCKS } from "./chatData";
import { ReferenceList } from "./ReferenceList";
import { ContinueCard } from "./ContinueCard";

// Corpo da resposta (Figma 0-279/0-459): blocos revelados em STREAMING
// progressivo (timeline GSAP, opacidade+y em folhas), depois ações
// (dislike/like/copiar), divisor, Referências e "Continue com mais perguntas".
// O chevron do status recolhe/expande o TEXTO da resposta (bodyOpen).
// `stream=false` monta tudo visível de uma vez — turnos force-answered por
// uma pergunta supersedente não re-streamam. Cada bloco de texto carrega
// `data-answer-block`: é a FRONTEIRA que a marquinha da StatusLine persegue
// enquanto desce (ver ChatTurn) — o GSAP escreve a opacidade inline que o
// ChatTurn lê para saber até onde já "gerou".
export function AnswerStream({
  bodyOpen,
  onFollowUp,
  stream = true,
}: {
  bodyOpen: boolean;
  onFollowUp: (question: string) => void;
  stream?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const reduce = useMemo(() => prefersReducedMotion(), []);

  // Streaming no mount (monta UMA vez, quando o turno vira answered — o valor
  // de `stream` no mount decide timeline × estático).
  useGSAP(
    () => {
      if (reduce || !stream) {
        gsap.set(".chat-block, .chat-after", { opacity: 1, y: 0 });
        return;
      }
      const tl = gsap.timeline();
      tl.fromTo(
        ".chat-block",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.45 },
      );
      tl.fromTo(
        ".chat-after",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.12 },
        ">-0.1",
      );
    },
    { scope: rootRef },
  );

  // Recolher/expandir o texto via chevron do status.
  useGSAP(
    () => {
      const el = bodyRef.current;
      if (!el) return;
      gsap.to(el, {
        height: bodyOpen ? "auto" : 0,
        opacity: bodyOpen ? 1 : 0,
        duration: reduce ? 0 : 0.42,
        ease: "power2.out",
      });
    },
    { dependencies: [bodyOpen], scope: rootRef },
  );

  const copyAnswer = () => {
    const plain = ANSWER_BLOCKS.map((b) =>
      b.kind === "bullet" ? `${b.lead}${b.text}` : b.text,
    ).join("\n\n");
    navigator.clipboard?.writeText(plain).catch(() => {});
  };

  return (
    <div ref={rootRef} className="flex flex-col px-4">
      <div ref={bodyRef} className="overflow-hidden">
        <div className="flex flex-col gap-6 pt-4 pb-6">
          {ANSWER_BLOCKS.map((b, i) => {
            if (b.kind === "h") {
              return (
                <p
                  key={i}
                  data-answer-block
                  className="chat-block text-[14px] leading-[1.6] font-bold text-ink"
                >
                  {b.text}
                </p>
              );
            }
            if (b.kind === "bullet") {
              return (
                <p key={i} data-answer-block className="chat-block text-[14px] leading-[1.6] text-ink">
                  <strong className="font-bold">{b.lead}</strong>
                  {b.text}
                </p>
              );
            }
            return (
              <p key={i} data-answer-block className="chat-block text-[14px] leading-[1.6] text-ink">
                {b.text}
              </p>
            );
          })}

          {/* Ações da resposta (ícones 20px, gap-24 — Figma). data-answer-actions
              = referência para a marquinha parar ~32px ACIMA dos ícones. */}
          <div data-answer-actions className="chat-block flex items-center gap-6">
            <ActionIcon src="/figma/icon-thumb-down.svg" label="Não ajudou" />
            <ActionIcon src="/figma/icon-thumb-up.svg" label="Ajudou" />
            <ActionIcon
              src="/figma/icon-copy.svg"
              label="Copiar resposta"
              onClick={copyAnswer}
            />
          </div>
        </div>
      </div>

      <div aria-hidden className="chat-after h-px w-full bg-border-default" />
      <ReferenceList className="chat-after mt-6" />
      <ContinueCard className="chat-after mt-6" onSelect={onFollowUp} />
    </div>
  );
}

function ActionIcon({
  src,
  label,
  onClick,
}: {
  src: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "transition-opacity hover:opacity-60",
        !onClick && "cursor-default",
      )}
    >
      <img src={src} alt="" className="size-5" />
    </button>
  );
}
