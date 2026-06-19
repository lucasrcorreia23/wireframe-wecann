import {
  ScreenShell,
  WireCard,
  WireButton,
  WireField,
} from "@/components/ui";

// `closure` — Encerramento.
export function ClosureScreen() {
  return (
    <ScreenShell
      zone="Consulta"
      title="Encerramento"
      lead="Finalize a consulta e dispare os documentos e o seguimento."
      actions={<WireButton variant="primary">Encerrar consulta</WireButton>}
    >
      <div className="grid grid-cols-2 gap-6">
        <WireCard eyebrow="Assinatura" title="Assinatura digital">
          <div className="flex h-28 items-center justify-center rounded-wire border border-dashed border-neutral-300 bg-paper-50">
            <span className="font-mono text-micro uppercase tracking-[0.12em] text-neutral-400">
              Certificado A3 · assinar
            </span>
          </div>
        </WireCard>

        <WireCard eyebrow="Seguimento" title="Agendar retorno">
          <div className="flex flex-col gap-3">
            <WireField label="Retorno" value="19/07/2026" mono />
            <WireField label="Modalidade" value="Teleconsulta" />
          </div>
        </WireCard>

        <WireCard eyebrow="Disparo" title="Disparo de documentos">
          <ul className="flex flex-col gap-2 text-body text-neutral-700">
            <li>Receita de controle especial</li>
            <li>Atestado e laudo</li>
            <li>Solicitação de exames</li>
          </ul>
        </WireCard>

        <WireCard eyebrow="Disparo" title="Questionário pós-consulta">
          <p className="text-body text-neutral-700">
            Envio automático do questionário de seguimento (PROM) 7 dias após a
            consulta.
          </p>
          <WireButton variant="secondary" size="sm" className="mt-3">
            Configurar disparo
          </WireButton>
        </WireCard>
      </div>
    </ScreenShell>
  );
}
