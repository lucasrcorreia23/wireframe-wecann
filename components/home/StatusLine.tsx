"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { ANSWERED_STATUS, CHAT_STATUSES } from "./chatData";

// Linha de status sob a pergunta (Figma): marca gradiente pequena + texto
// Inter Medium 12 #676867. Em "asking" as mensagens CICLAM (1.6s) e a marca
// pulsa; em "answered" vira "Consulta analisada..." com chevron que
// recolhe/expande o corpo da resposta.
export function StatusLine({
  phase,
  session,
  bodyOpen,
  onToggle,
  className,
  statuses = CHAT_STATUSES,
  answeredStatus = ANSWERED_STATUS,
}: {
  phase: "asking" | "answered";
  session: number;
  bodyOpen: boolean;
  onToggle: () => void;
  className?: string;
  /** Conjunto de copies do loading (default genérico; variante de paciente no
   *  fluxo "Discutir um caso"). */
  statuses?: string[];
  answeredStatus?: string;
}) {
  const [idx, setIdx] = useState(0);
  const rootRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const markRef = useRef<HTMLImageElement>(null);
  const reduce = useMemo(() => prefersReducedMotion(), []);
  const answered = phase === "answered";

  // Ciclo das mensagens de loading (re-keyado por pergunta).
  useEffect(() => {
    if (phase !== "asking") return;
    setIdx(0);
    if (reduce) return;
    const iv = setInterval(
      () => setIdx((i) => (i + 1) % statuses.length),
      1600,
    );
    return () => clearInterval(iv);
  }, [phase, session, reduce, statuses.length]);

  // Crossfade do texto a cada troca de mensagem/fase.
  useGSAP(
    () => {
      if (!textRef.current || reduce) return;
      gsap.fromTo(
        textRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power1.out" },
      );
    },
    { dependencies: [idx, phase], scope: rootRef },
  );

  // Vida da marca gradiente: durante o loading ela dá GIROS de 180° em
  // cadência (flip → pausa → flip), em vez de piscar. No answered assenta na
  // orientação do mock (180°). Reduced-motion: estática.
  useGSAP(
    () => {
      const el = markRef.current;
      if (!el) return;
      if (phase === "asking" && !reduce) {
        gsap.set(el, { rotation: 0, opacity: 1 });
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.45 });
        tl.to(el, {
          rotation: "+=180",
          duration: 0.6,
          ease: "power2.inOut",
        });
        return;
      }
      // Answered: mata QUALQUER movimento e assenta na orientação do mock.
      gsap.killTweensOf(el);
      gsap.set(el, { rotation: 180, opacity: 1 });
    },
    { dependencies: [phase, session], scope: rootRef },
  );

  return (
    <button
      ref={rootRef}
      type="button"
      onClick={answered ? onToggle : undefined}
      aria-expanded={answered ? bodyOpen : undefined}
      className={cn(
        "flex w-max items-center gap-1 rounded-full py-2 pr-3 pl-4",
        answered ? "cursor-pointer" : "cursor-default",
        className,
      )}
    >
      <span className="flex items-center gap-2">
        {/* A marca vive num SLOT de tamanho fixo (reserva o espaço inline — o
            copy nunca reflui) que serve de ORIGEM de medição. O wrapper de
            VIAGEM é transladado pelo ChatTurn (só no turno ativo) para a marca
            DESCER acompanhando a geração; o <img> guarda só a rotação (giro no
            pensamento / assenta em 180 no answered) — translate e rotação em
            elementos diferentes = sem conflito. */}
        <span data-mark-slot className="relative inline-block h-2 w-4">
          <span data-mark-travel className="absolute inset-0 will-change-transform">
            <img
              ref={markRef}
              src="/figma/icon-loading-mark.svg"
              alt=""
              className="h-2 w-4"
            />
          </span>
        </span>
        <span
          ref={textRef}
          className="text-[12px] font-medium leading-[1.4] text-secondary"
        >
          {answered ? answeredStatus : statuses[idx]}
        </span>
      </span>
      {answered && (
        <img
          src="/figma/icon-chevron-soft.svg"
          alt=""
          className={cn(
            "size-6 transition-transform duration-300",
            bodyOpen ? "rotate-90" : "rotate-0",
          )}
        />
      )}
    </button>
  );
}
