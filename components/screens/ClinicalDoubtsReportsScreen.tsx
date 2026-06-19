import {
  ScreenShell,
  WireCard,
  WireButton,
  WireBadge,
} from "@/components/ui";

// `clinical-doubts-reports` — Dúvidas clínicas e laudos.
export function ClinicalDoubtsReportsScreen() {
  return (
    <ScreenShell
      zone="Pós-consulta"
      title="Dúvidas clínicas e laudos"
      lead="Responda dúvidas encaminhadas e emita os documentos necessários."
    >
      <div className="grid grid-cols-3 gap-6">
        <WireCard
          className="col-span-2"
          eyebrow="Fila"
          title="Dúvidas encaminhadas"
        >
          <ul className="flex flex-col divide-y divide-neutral-200">
            {[
              ["Marina Castro", "Posso tomar com o anti-hipertensivo?", "soft"],
              ["Rui Salgado", "Receita venceu, como renovar?", "mid"],
              ["Júlia Tavares", "Efeito demora quanto para iniciar?", "soft"],
            ].map(([nome, q, tone]) => (
              <li
                key={nome}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-body font-medium text-ink">{nome}</span>
                  <span className="text-caption text-neutral-600">{q}</span>
                </div>
                <div className="flex items-center gap-3">
                  <WireBadge tone={tone as "soft" | "mid"}>
                    {tone === "mid" ? "Atenção" : "Informativo"}
                  </WireBadge>
                  <WireButton variant="secondary" size="sm">
                    Responder
                  </WireButton>
                </div>
              </li>
            ))}
          </ul>
        </WireCard>

        <div className="flex flex-col gap-6">
          <WireCard eyebrow="Laudo" title="Emitir / atualizar laudo">
            <div className="flex flex-col gap-2">
              <WireButton variant="primary" size="sm">
                Emitir novo laudo
              </WireButton>
              <WireButton variant="secondary" size="sm">
                Atualizar laudo existente
              </WireButton>
            </div>
          </WireCard>
          <WireCard eyebrow="Documentos" title="Gerar documentos">
            <ul className="flex flex-col gap-2 text-body text-neutral-700">
              <li>Relatório médico</li>
              <li>Declaração de uso contínuo</li>
              <li>Termo de consentimento</li>
            </ul>
          </WireCard>
        </div>
      </div>
    </ScreenShell>
  );
}
