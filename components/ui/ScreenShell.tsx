import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";
import { BackButton } from "./BackButton";

// Moldura consistente de cada estação/tela. Cabeçalho editorial (eyebrow de fase
// + título display) e corpo. Largura fixa para ler como "tela" — também é o
// tamanho do plano <Html transform> no mundo 3D (Fase 3).
export function ScreenShell({
  zone,
  icon,
  title,
  lead,
  actions,
  children,
  className,
}: {
  /** Rótulo de fase do fluxo. Opcional: telas-destino (menu) não usam. */
  zone?: string;
  /** Ícone boxicon sutil ao lado da zona (ex.: "bx-note"). */
  icon?: string;
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
          {zone ? <Eyebrow icon={icon}>{zone}</Eyebrow> : null}
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="font-display text-display-s font-medium text-ink text-balance">
              {title}
            </h1>
          </div>
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
