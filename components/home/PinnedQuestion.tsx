"use client";

import { useEffect, useRef } from "react";
import { homeChat } from "@/lib/homeChat";

// Mensagem FIXADA do chat (pill branca, réguas exatas do Figma). Mede a
// própria posição por frame (rAF) e publica no canal homeChat — a orb 3D
// persegue o canto superior-esquerdo da pill ("iluminando o canto da caixa"),
// mesmo durante o tween de saída da sidebar ou resize. O rAF é barato (um
// getBoundingClientRect por frame num único elemento) e morre no unmount.
export function PinnedQuestion({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const el = ref.current;
      if (el) {
        const r = el.getBoundingClientRect();
        // Centro da orb ≈ canto sup-esquerdo da pill (offsets do mock 0-174).
        homeChat.anchorX = r.left + 2;
        homeChat.anchorY = r.top - 3;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      homeChat.anchorX = 0;
      homeChat.anchorY = 0;
    };
  }, []);

  return (
    <div
      ref={ref}
      className="rounded-[20px] border border-border-soft bg-white p-[13px]"
    >
      <p className="text-[14px] leading-[1.6] text-ink">{text}</p>
    </div>
  );
}
