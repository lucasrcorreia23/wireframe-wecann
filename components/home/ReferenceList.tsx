"use client";

import { useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { REFERENCES, TAG_DOT } from "./chatData";

// Seção "Referências" (Figma 0-279): header com ícone de lista + título serif
// + chevron colapsável; itens numerados com título laranja, fonte (bolinha
// vermelha quando "quente"), autores e chips de tag; ícone de livro à direita
// em algumas. Réguas exatas do mock (gap-16 entre itens, gap-6 interno).
export function ReferenceList({ className }: { className?: string }) {
  const [open, setOpen] = useState(true);
  const bodyRef = useRef<HTMLDivElement>(null);
  const reduce = useMemo(() => prefersReducedMotion(), []);

  useGSAP(
    () => {
      const el = bodyRef.current;
      if (!el) return;
      gsap.to(el, {
        height: open ? "auto" : 0,
        opacity: open ? 1 : 0,
        duration: reduce ? 0 : 0.42,
        ease: "power2.out",
      });
    },
    { dependencies: [open] },
  );

  return (
    <section className={cn("flex flex-col", className)}>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/figma/icon-list.svg" alt="" className="size-6" />
          <h3 className="font-display text-[20px] font-semibold leading-[1.4] text-ink">
            Referências
          </h3>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-label="Recolher referências"
          onClick={() => setOpen((o) => !o)}
        >
          <img
            src="/figma/icon-chevron-soft.svg"
            alt=""
            className={cn(
              "size-6 transition-transform duration-300",
              open ? "rotate-90" : "rotate-0",
            )}
          />
        </button>
      </header>

      <div ref={bodyRef} className="overflow-hidden">
        <div className="flex flex-col gap-4 pt-6">
          {REFERENCES.map((r, i) => (
            <article key={r.title} className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <h4 className="text-[14px] font-semibold leading-[1.4] text-[#f37b50]">
                  {i + 1}. {r.title}
                </h4>
                {(r.source || r.authors || r.tags) && (
                  <div className="flex flex-col items-start gap-1.5">
                    {r.source && (
                      <p className="flex items-center gap-1.5 text-[14px] leading-[1.6] text-ink">
                        {r.hot && (
                          <span
                            aria-hidden
                            className="size-2 shrink-0 rounded-full bg-highlight"
                          />
                        )}
                        {r.source}
                      </p>
                    )}
                    {r.authors && (
                      <p className="text-[12px] leading-[1.4] text-secondary">
                        {r.authors}
                      </p>
                    )}
                    {r.tags && r.tags.length > 0 && (
                      <div className="flex gap-1.5">
                        {r.tags.map((t) => (
                          <span
                            key={t}
                            className="flex items-center gap-[5px] rounded-full bg-neutral-100 px-2 py-1"
                          >
                            <span
                              aria-hidden
                              className="size-1.5 rounded-[3px]"
                              style={{ background: TAG_DOT[t] }}
                            />
                            <span className="text-[12px] font-semibold leading-none text-ink">
                              {t}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {r.book && (
                <img
                  src="/figma/icon-book.svg"
                  alt=""
                  className="size-6 shrink-0"
                />
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
