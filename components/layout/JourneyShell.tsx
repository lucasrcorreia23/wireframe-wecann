"use client";

import { useEffect, useRef } from "react";
import { AIDock } from "@/components/chrome/AIDock";
import { viewScroll } from "@/lib/viewScroll";
import { cn } from "@/lib/cn";

// Shell de jornada: 3 colunas sobre o mundo 3D, mas numa SUPERFÍCIE DE SCROLL
// ÚNICA — tudo rola junto. `overflow` NÃO quebra o backdrop-filter, então o vidro
// dos módulos fica intacto. As bordas suaves vêm de overlays em gradiente (irmãos,
// por cima — nunca `mask`, que mataria o blur). O scroll alimenta `viewScroll`
// (canal p/ o mundo 3D: CameraRig faz pan e a orb sobe → sensação de "descer a
// câmera"). O quadro inteiro é `orbit-pane` → desliza como bloco na navegação.
export function JourneyShell({
  left,
  children,
  overlay,
  className,
}: {
  left?: React.ReactNode; // pilha de ModuleCard
  children: React.ReactNode; // conteúdo central
  /** Camada sobreposta ao shell inteiro (ex.: painel de detalhe deslizante). */
  overlay?: React.ReactNode;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Alimenta o canal do mundo 3D: rolar move a câmera/orb (viewScroll.progress).
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    viewScroll.progress = max > 0 ? el.scrollTop / max : 0;
  };

  useEffect(() => {
    handleScroll(); // progresso inicial
    return () => {
      // Ao sair da tela, zera o progresso → câmera/orb voltam ao repouso.
      viewScroll.progress = 0;
    };
  }, []);

  return (
    <div
      className={cn(
        // Superfície de scroll ocupa o VIEWPORT INTEIRO (borda a borda). O conteúdo
        // corta na borda real da tela, passando sob o chrome flutuante; o
        // micro-fade global (ChromeOverlay) suaviza a bordinha. `z-0` mantém o
        // contexto de empilhamento sem virar backdrop-root (vidro intacto).
        "orbit-pane relative z-0 h-screen w-full max-w-[1240px]",
        className,
      )}
    >
      {/* Superfície de scroll única — as 3 colunas rolam juntas. O `pt-24`/`pb-12`
          é o SAFE-AREA: em repouso o 1º/último card fica livre do chrome; ao rolar,
          o conteúdo sangra até a borda do viewport. */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar h-full overflow-y-auto"
      >
        <div
          className="grid items-start gap-4 pt-24 pb-12"
          style={{ gridTemplateColumns: "minmax(0,0.9fr) minmax(0,1.7fr) minmax(0,1fr)" }}
        >
          {/* Esquerda — módulos complementares. */}
          <div className="flex flex-col gap-4">{left}</div>
          {/* Centro — conteúdo principal. */}
          <div className="flex min-w-0 flex-col gap-4">{children}</div>
          {/* Direita — companheiro de IA. */}
          <AIDock />
        </div>
      </div>

      {/* Camada sobreposta (painel de detalhe) — posiciona contra o box do shell. */}
      {overlay}
    </div>
  );
}
