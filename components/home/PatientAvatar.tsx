import { cn } from "@/lib/cn";
import type { Patient } from "@/lib/patients";

// Avatar do paciente: iniciais sobre gradiente pastel determinístico (não há
// fotos de paciente nos assets — só a do médico). A cor nasce do id, então o
// mesmo paciente tem sempre o mesmo avatar em todo o produto.
const GRADIENTS = [
  ["#f3ac50", "#f36350"], // laranja→coral
  ["#b388eb", "#8f6fe0"], // roxo
  ["#96adff", "#588dff"], // azul
  ["#88eac5", "#4bc99b"], // menta
  ["#f3a998", "#f36350"], // coral
];

function toneOf(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % GRADIENTS.length;
  return GRADIENTS[h];
}

export function PatientAvatar({
  patient,
  className,
}: {
  patient: Patient;
  /** Tamanho/tipografia via classe (ex.: "size-11 text-[13px]"). */
  className?: string;
}) {
  const [from, to] = toneOf(patient.id);
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-medium text-white",
        className ?? "size-9 text-[12px]",
      )}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {patient.initials}
    </span>
  );
}
