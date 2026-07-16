"use client";

import { useEffect, useRef } from "react";
import { homeChat } from "@/lib/homeChat";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Pill branca da pergunta (réguas exatas do Figma). Quando `active` (última
// pergunta) mede a PRÓPRIA posição por frame (rAF) e publica a âncora no canal
// homeChat — o globo 3D fica parado "iluminando o canto superior-esquerdo" da
// caixa (offsets do mock). Se a pill vive DENTRO do scroller (multi-turno)
// também publica o alpha que dissolve o globo junto do texto nas zonas de fade
// (nunca passa sobre o header); fora do scroller (pill FIXA do 1º turno) o
// alpha é 1. No handoff entre pills a âncora NÃO é zerada aqui (zerar faria o
// AiGlobe cair no fallback do mock por alguns frames → solavanco) — a
// HomeScreen zera quando o chat volta ao idle/desmonta.
export function QuestionPill({
  text,
  active = false,
}: {
  text: string;
  active?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const loop = () => {
      const el = ref.current;
      if (el) {
        const r = el.getBoundingClientRect();
        // Centro do globo ≈ canto sup-esquerdo da pill (offsets do mock 0-174).
        homeChat.anchorX = r.left + 2;
        homeChat.anchorY = r.top - 3;
        // Alpha espelha as máscaras do scroller (topo 64px, gateado pelo
        // scroll; base 56px sempre).
        const scroller = el.closest("[data-chat-scroll]");
        if (scroller) {
          const s = scroller.getBoundingClientRect();
          const topAlpha =
            scroller.scrollTop <= 4 ? 1 : clamp01((r.top - s.top) / 64);
          const bottomAlpha = clamp01((s.bottom - r.top) / 56);
          homeChat.anchorAlpha = topAlpha * bottomAlpha;
        } else {
          homeChat.anchorAlpha = 1;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div
      ref={ref}
      className="rounded-[20px] border border-border-soft bg-white p-[13px]"
    >
      <p className="text-[14px] leading-[1.6] text-ink">{text}</p>
    </div>
  );
}
