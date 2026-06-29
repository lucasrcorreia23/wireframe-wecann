import { cn } from "@/lib/cn";

// Frame de página no padrão do Figma: COLUNA ÚNICA centralizada, padding lateral
// que escala (até ~128px em telas largas), max-width ~1184px, gap vertical de 24px.
// Todas as telas de conteúdo usam este wrapper. O scroll é provido pelo shell.
export function AppScreen({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex w-full justify-center px-6 py-10 md:px-12 lg:px-20 xl:px-[128px]">
      <div className={cn("flex w-full max-w-[1184px] flex-col gap-6", className)}>
        {children}
      </div>
    </div>
  );
}
