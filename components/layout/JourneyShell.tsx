import { AIDock } from "@/components/chrome/AIDock";
import { cn } from "@/lib/cn";

// Shell de jornada: 3 colunas sobre o mundo 3D. Esquerda = módulos "soltos no ar"
// (cards de vidro), centro = conteúdo principal, direita = IA (AIDock). Usado em
// todas as telas da jornada não-Home (Paciente 360, Consulta, Relatório).
export function JourneyShell({
  left,
  children,
  className,
}: {
  left?: React.ReactNode; // pilha de ModuleCard
  children: React.ReactNode; // conteúdo central
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid h-[min(780px,86vh)] w-full max-w-[1240px] items-stretch gap-4",
        className,
      )}
      style={{
        gridTemplateColumns: "minmax(0,0.9fr) minmax(0,1.7fr) minmax(0,1fr)",
      }}
    >
      {/* Esquerda — módulos complementares (flutuam separados). */}
      <div className="no-scrollbar flex min-h-0 flex-col gap-4 overflow-y-auto">
        {left}
      </div>

      {/* Centro — conteúdo principal. */}
      <div className="no-scrollbar flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto">
        {children}
      </div>

      {/* Direita — companheiro de IA. */}
      <AIDock />
    </div>
  );
}
