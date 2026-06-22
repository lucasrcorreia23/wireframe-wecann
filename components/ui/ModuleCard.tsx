import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";

// Card de módulo "solto no ar": vidro translúcido que flutua sobre o mundo 3D.
// Cabeçalho opcional (eyebrow + título + aside) e corpo livre.
export function ModuleCard({
  eyebrow,
  title,
  aside,
  children,
  className,
}: {
  eyebrow?: string;
  title?: string;
  aside?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "glass-panel-blue backdrop-blur-2xl flex flex-col gap-3 rounded-[24px] p-5",
        className,
      )}
    >
      {eyebrow || title || aside ? (
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
            {title ? (
              <h3 className="text-body-l font-medium text-ink text-balance">
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
