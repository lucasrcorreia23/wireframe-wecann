import { cn } from "@/lib/cn";
import type { Patient } from "@/lib/patients";
import { PatientAvatar } from "./PatientAvatar";

// Chip do paciente fixado (avatar + nome sobre o gradiente brand sutil —
// mesmo fundo da pílula "Discutir um caso"). Usado na faixa da linha de
// status durante o chat escopo; `onRemove` opcional adiciona o ✕.
export function PatientChip({
  patient,
  onRemove,
  className,
}: {
  patient: Patient;
  onRemove?: () => void;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full pl-1.5 pr-4",
        onRemove && "pr-2",
        className,
      )}
      style={{
        background:
          "linear-gradient(90deg, rgba(88,141,255,0.18) 0%, rgba(148,184,240,0.14) 28%, rgba(243,99,80,0.14) 55%, rgba(252,215,87,0.18) 100%)",
      }}
    >
      <PatientAvatar patient={patient} className="size-7 text-[10px]" />
      <span className="text-[14px] font-medium leading-[1.4] text-ink">
        {patient.name}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Desafixar paciente"
          className="grid size-5 place-items-center rounded-full text-neutral-500 transition-colors hover:text-ink"
        >
          <i className="bx bx-x text-lg" />
        </button>
      )}
    </span>
  );
}
