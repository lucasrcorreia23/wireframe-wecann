"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

// Modal-painel deslizante PADRÃO da plataforma (o "feel da pílula"): entra pela
// direita com GSAP `power2.out` em 0.5s (xPercent 100→0 + opacity), idêntico ao
// painel de pílula da Home. O transform vive no PRÓPRIO painel (vidro) — seguro
// p/ o backdrop-filter (só transform em ANCESTRAL mataria o blur).
//
// É renderizado num PORTAL (document.body) cobrindo a viewport inteira, com um
// SCRIM DESFOCADO (backdrop-blur) atrás — o "overlay desfocado". `backdrop=false`
// dispensa o scrim. `className` define a largura (ex.: "max-w-[560px]").
export function SlideOverPanel({
  open,
  onClose,
  children,
  className,
  backdrop = true,
  label,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  backdrop?: boolean;
  label?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inited = useRef(false);
  // Portal só após o mount: o 1º render do cliente bate com o do servidor (null),
  // evitando hydration mismatch; depois re-renderiza com o portal em document.body.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useGSAP(
    () => {
      const el = panelRef.current;
      if (!el) return;
      const to = { xPercent: open ? 0 : 100, opacity: open ? 1 : 0 };
      // Estado inicial sem animação (não desliza no mount); depois anima nas trocas.
      if (!inited.current) {
        inited.current = true;
        gsap.set(el, to);
        return;
      }
      gsap.to(el, { ...to, duration: 0.5, ease: "power2.out" });
    },
    { dependencies: [open] },
  );

  // Portal client-only (SSR e 1ª hidratação retornam null; monta depois).
  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[60]">
      {backdrop ? (
        <div
          onClick={onClose}
          aria-hidden
          className={cn(
            "absolute inset-0 bg-[#e6e6e4]/40 backdrop-blur-md transition-opacity duration-500",
            open ? "pointer-events-auto opacity-100" : "opacity-0",
          )}
        />
      ) : null}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-hidden={!open}
        className={cn(
          "glass-panel-blue backdrop-blur-2xl absolute inset-y-0 right-0 my-auto flex h-fit max-h-full w-full flex-col rounded-[28px] p-7 opacity-0",
          open ? "pointer-events-auto" : "pointer-events-none",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
