import {
  ScreenShell,
  WireCard,
  WireButton,
  WireBadge,
  WireField,
  Eyebrow,
} from "@/components/ui";

// `clinical-note` — Nota clínica (anamnese/evolução).
export function ClinicalNoteScreen() {
  return (
    <ScreenShell
      zone="Consulta"
      title="Nota clínica"
      lead="Anamnese e evolução · preenchimento automático pela transcrição."
      actions={
        <>
          <WireButton variant="secondary">Editar</WireButton>
          <WireButton variant="primary">Confirmar</WireButton>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <WireBadge tone="soft">Modelo: Dor crônica</WireBadge>
        <WireBadge tone="neutral">Preenchimento automático</WireBadge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* SOAP */}
        <div className="col-span-2 grid grid-cols-2 gap-6">
          <WireField
            label="Subjetivo"
            area
            value="Dor lombar persistente, pior à noite; sono fragmentado."
          />
          <WireField
            label="Objetivo"
            area
            value="Mobilidade reduzida; sem sinais de alerta neurológico."
          />
          <WireField
            label="Avaliação"
            area
            value="Dor crônica nociplástica; perfil para canabinoide adjuvante."
          />
          <WireField
            label="Plano"
            area
            value="Introduzir CBD; reduzir tramadol gradual; reavaliar em 30 dias."
          />
        </div>

        {/* Codificação CID + Copiloto */}
        <div className="flex flex-col gap-6">
          <WireCard eyebrow="Automático" title="Codificação (CID)">
            <ul className="flex flex-col divide-y divide-neutral-200">
              {[
                ["M54.5", "Dor lombar baixa"],
                ["M79.7", "Fibromialgia"],
                ["G47.0", "Insônia"],
              ].map(([code, desc]) => (
                <li
                  key={code}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <span className="font-mono text-caption text-ink">{code}</span>
                  <span className="text-caption text-neutral-500">{desc}</span>
                </li>
              ))}
            </ul>
          </WireCard>

          <WireCard
            eyebrow="Copiloto"
            title="Perguntas-chave e insights"
            emphasis
          >
            <ul className="flex flex-col gap-2.5">
              {[
                "Investigar qualidade do sono nas últimas 2 semanas.",
                "Confirmar tentativas prévias de desmame de opioide.",
                "Sugerir escala de dor validada (PROM) no retorno.",
              ].map((tip, i) => (
                <li key={i} className="flex gap-2 text-caption text-neutral-700">
                  <span className="font-mono text-neutral-400">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-neutral-200 pt-3">
              <Eyebrow>Insight</Eyebrow>
              <p className="mt-1 text-caption text-neutral-600">
                Padrão compatível com resposta favorável a CBD em coortes
                semelhantes.
              </p>
            </div>
          </WireCard>
        </div>
      </div>
    </ScreenShell>
  );
}
