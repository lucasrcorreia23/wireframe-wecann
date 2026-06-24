import { SCREENS } from "./index";

const ORDER = ["home", "messages", "patients", "consult", "analise"] as const;

// Galeria estática (Fase 1): empilha as telas para travar fidelidade de
// conteúdo, grayscale e escala tipográfica antes do 3D. Persistida em /gallery.
export function ScreenGallery() {
  return (
    <main className="flex flex-col items-center gap-16 bg-neutral-100 py-16">
      {ORDER.map((id, i) => {
        const Screen = SCREENS[id];
        return (
          <div key={id} className="flex flex-col items-center gap-3">
            <span className="font-mono text-micro uppercase tracking-[0.14em] text-neutral-500">
              {String(i + 1).padStart(2, "0")} · {id}
            </span>
            <div className="overflow-hidden rounded-wire border border-neutral-200 shadow-sm">
              <Screen />
            </div>
          </div>
        );
      })}
    </main>
  );
}
