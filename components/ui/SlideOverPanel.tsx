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
  footer,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  backdrop?: boolean;
  label?: string;
  /**
   * Barra de CTA fixa no rodapé (regra da plataforma): vidro colado embaixo, com o
   * conteúdo do corpo rolando ATRÁS dela. O corpo (children) precisa reservar um
   * `pb` ~= altura da barra para o último item não ficar escondido. Já aplica o
   * layout comum dos botões (`flex justify-end gap-3`).
   */
  footer?: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inited = useRef(false);
  // Portal só após o mount: o 1º render do cliente bate com o do servidor (null),
  // evitando hydration mismatch; depois re-renderiza com o portal em document.body.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Congela o conteúdo enquanto o painel desliza p/ FORA: ao fechar, o consumidor
  // zera os dados (appt/pill → null) e o corpo esvaziaria, fazendo o `h-fit`
  // encolher no meio da animação de saída (parecia "ir ficando pequeno"). Guardamos
  // o último conteúdo aberto e o mantemos durante o fechamento — o painel sai com o
  // mesmo tamanho com que entrou. Em offscreen/fechado isso é inofensivo.
  const lastOpen = useRef({ children, footer });
  if (open) lastOpen.current = { children, footer };
  const shownChildren = open ? children : lastOpen.current.children;
  const shownFooter = open ? footer : lastOpen.current.footer;

  useGSAP(
    () => {
      const el = panelRef.current;
      if (!el) return;
      // `x` extra (= gap lateral) além do translate de 100% p/ o painel limpar o
      // respiro de `right-8` e sumir por completo (senão sobraria uma fresta).
      const to = { xPercent: open ? 0 : 100, x: open ? 0 : 32, opacity: open ? 1 : 0 };
      // Estado inicial sem animação (não desliza no mount); depois anima nas trocas.
      if (!inited.current) {
        inited.current = true;
        gsap.set(el, to);
        return;
      }
      gsap.to(el, { ...to, duration: 0.5, ease: "power2.out" });
    },
    // `mounted` entra nas deps p/ o efeito re-rodar quando o portal monta: aí o
    // panelRef já existe e o estado inicial (fechado) é fixado no elemento real;
    // sem isso, a 1ª abertura caía no branch de init e aparecia sem deslizar.
    { dependencies: [open, mounted] },
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
          // Gap garantido nos 4 lados: o modal flutua sem encostar nas bordas.
          // Vertical: `my-auto` centra e `max-h-[calc(100dvh-4rem)]` capa deixando
          // ~2rem de respiro em cima/embaixo. Lateral: `right-8` (2rem), no mesmo
          // ritmo do respiro vertical. `overflow-hidden` recorta o rodapé fixo nos
          // cantos arredondados.
          "glass-panel-blue backdrop-blur-2xl absolute inset-y-0 right-8 my-auto flex h-fit max-h-[calc(100dvh-4rem)] w-full flex-col overflow-hidden rounded-[28px] p-7 opacity-0",
          open ? "pointer-events-auto" : "pointer-events-none",
          className,
        )}
      >
        {shownChildren}

        {shownFooter ? (
          // CTA fixo: barra de vidro colada no rodapé; o conteúdo do corpo passa
          // ATRÁS dela (backdrop-blur sobre o que está rolando). Alinhada às bordas
          // do painel (ignora o p-7) e recortada pelo overflow-hidden.
          <div className="absolute inset-x-0 bottom-0 border-t border-white/50 bg-white/45 backdrop-blur-xl">
            <div className="flex items-center justify-end gap-3 px-7 py-5">
              {shownFooter}
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
