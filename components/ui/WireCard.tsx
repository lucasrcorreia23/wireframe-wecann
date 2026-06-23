import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";

// Card wireframe: bordas hairline, radius quase reto, sem sombra (profundidade
// vem do 3D, não de box-shadow §2.3). `emphasis` aumenta o peso da borda para
// blocos de alta relevância — gravidade por espessura, nunca por cor (§2.1).
export function WireCard({
  children,
  eyebrow,
  icon,
  title,
  aside,
  emphasis = false,
  className,
}: {
  children?: React.ReactNode;
  eyebrow?: string;
  /** Ícone boxicon sutil ao lado do eyebrow (ex.: "bx-file"). */
  icon?: string;
  title?: React.ReactNode;
  aside?: React.ReactNode;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-wire bg-paper",
        emphasis
          ? "border-2 border-neutral-400"
          : "border border-neutral-200",
        "p-5",
        className,
      )}
    >
      {(eyebrow || title || aside) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            {eyebrow ? <Eyebrow icon={icon}>{eyebrow}</Eyebrow> : null}
            {title ? (
              <h3 className="flex items-center gap-2 text-title font-medium text-ink text-pretty">
                {!eyebrow && icon ? (
                  <i className={cn("bx shrink-0 text-base text-neutral-400", icon)} />
                ) : null}
                {title}
              </h3>
            ) : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
