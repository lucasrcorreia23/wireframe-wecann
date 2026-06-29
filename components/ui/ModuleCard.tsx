import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";
import { Icon } from "./Icon";

// Escala de blocos consolidada (proposta de design 2D):
//  • sm  → resumos (coluna ESQUERDA, alimentada pela IA)
//  • md  → informações complementares (default — preserva o look atual)
//  • lg  → conteúdo denso (coluna CENTRO / foco principal)
// A base de vidro (glass-panel-blue) é a mesma em todos; só raio/padding/gap e a
// tipografia do título mudam por tamanho, mantendo o padrão da pílula.
export type ModuleCardSize = "sm" | "md" | "lg";

const SIZE: Record<
  ModuleCardSize,
  { shell: string; gap: string; title: string }
> = {
  sm: { shell: "rounded-[20px] p-3", gap: "gap-2", title: "text-body" },
  md: { shell: "rounded-[24px] pt-4 pb-4 px-4", gap: "gap-3", title: "text-body-l" },
  lg: { shell: "rounded-[28px] p-6", gap: "gap-4", title: "text-title" },
};

// Card de módulo "solto no ar": vidro translúcido que flutua sobre o fundo.
// Header: label (eyebrow/título) à ESQUERDA e ação (`aside`) à DIREITA, alinhados
// verticalmente ao CENTRO (um em cada extremidade). Altura mínima fixa (h-9) para
// alinhar pixel-perfect entre colunas paralelas.
export function ModuleCard({
  eyebrow,
  title,
  icon,
  aside,
  size = "md",
  children,
  className,
}: {
  eyebrow?: string;
  title?: string;
  /** Ícone boxicon sutil exibido ao lado do eyebrow (ex.: "bx-calendar"). */
  icon?: string;
  aside?: React.ReactNode;
  /** Escala do bloco: sm (resumo) · md (complementar) · lg (denso). Default md. */
  size?: ModuleCardSize;
  children?: React.ReactNode;
  className?: string;
}) {
  const hasHeader = eyebrow || title || aside;
  const s = SIZE[size];

  return (
    <section
      className={cn(
        "glass-panel-blue backdrop-blur-2xl flex flex-col",
        s.shell,
        s.gap,
        className,
      )}
    >
      {hasHeader ? (
        <header className="flex pl-1 min-h-9 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            {eyebrow ? <Eyebrow icon={icon}>{eyebrow}</Eyebrow> : null}
            {title ? (
              <h3
                className={cn(
                  "flex items-center gap-2 font-medium text-ink text-balance",
                  s.title,
                )}
              >
                {!eyebrow && icon ? (
                  <Icon name={icon} className="shrink-0 text-base text-neutral-400" />
                ) : null}
                {title}
              </h3>
            ) : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
