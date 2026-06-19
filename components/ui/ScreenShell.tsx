import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";

// Moldura consistente de cada estação/tela. Cabeçalho editorial (eyebrow de fase
// + título display) e corpo. Largura fixa para ler como "tela" — também é o
// tamanho do plano <Html transform> no mundo 3D (Fase 3).
export function ScreenShell({
  zone,
  title,
  lead,
  actions,
  children,
  className,
}: {
  zone: string;
  title: string;
  lead?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex w-[1160px] max-w-full flex-col gap-8 bg-paper p-12",
        className,
      )}
    >
      <header className="flex items-end justify-between gap-8 border-b border-neutral-200 pb-6">
        <div className="flex flex-col gap-3">
          <Eyebrow>{zone}</Eyebrow>
          <h1 className="font-display text-display-m font-medium text-ink text-balance">
            {title}
          </h1>
          {lead ? (
            <p className="max-w-xl text-body-l text-neutral-600 text-pretty">
              {lead}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </header>
      {children}
    </article>
  );
}
