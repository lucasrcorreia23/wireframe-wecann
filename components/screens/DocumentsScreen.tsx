"use client";

import { useState } from "react";
import { AppScreen, ScreenHeader, Eyebrow, Avatar, Chip, Icon, WireButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { DOC_TYPES, SIMPLE_TEMPLATES, type DocType } from "./documents-data";

// `documents` — Documents Studio (padrão Memed). Gera/revisa/assina/envia documentos
// clínicos. Coração = prescrição estruturada (busca → editor → lote → preview A4 →
// assinar/enviar). Conteúdo conforme contrato DOCUMENTOS §6. Monocromático (aba
// ativa = ink). Larguras flex (sem spacer vazio); ícones SVG (lucide).

/* ============================ DADOS (mock) ============================ */

// DocType/DOC_TYPES/SIMPLE_TEMPLATES vivem em documents-data.ts (compartilhados
// com o wizard "Gerar documento" do Paciente 360).

type Med = { name: string; ingredient: string; maker: string; type: string; cannabis: boolean; count: number };

const SEARCH_SECTIONS: { title: string; items: Med[] }[] = [
  {
    title: "Mais prescritos por você",
    items: [
      { name: "Canabidiol 200mg/mL", ingredient: "Canabidiol (CBD)", maker: "WeCann Pharma", type: "Controle especial", cannabis: true, count: 42 },
      { name: "Amitriptilina 25mg", ingredient: "Amitriptilina", maker: "EMS", type: "Receita branca", cannabis: false, count: 31 },
    ],
  },
  {
    title: "Cannabis (curadoria WeCann)",
    items: [
      { name: "CBD : THC 20:1 · 30mL", ingredient: "CBD/THC", maker: "WeCann", type: "Controle especial", cannabis: true, count: 18 },
    ],
  },
  {
    title: "Catálogo",
    items: [
      { name: "Pregabalina 75mg", ingredient: "Pregabalina", maker: "Genérico", type: "Receita branca", cannabis: false, count: 9 },
    ],
  },
];

type Item = { name: string; cannabis: boolean; ai: boolean; posologia: string; meta: string; dispensar: string };

const INITIAL_ITEMS: Item[] = [
  { name: "Canabidiol 200mg/mL", cannabis: true, ai: true, posologia: "5 gotas, via oral, de 8/8 horas", meta: "90 mg CBD/dia", dispensar: "1 frasco" },
  { name: "Amitriptilina 25mg", cannabis: false, ai: false, posologia: "1 comprimido à noite, via oral", meta: "25 mg/dia", dispensar: "30 comprimidos" },
];

const EXAMS = ["Hemograma completo", "Perfil hepático (TGO/TGP)", "Função renal (ureia/creatinina)", "Dosagem de vitamina D"];

const CHECKLIST = [
  { label: "Paciente identificado", done: true },
  { label: "Pelo menos 1 item no documento", done: true },
  { label: "Posologia definida em todos os itens", done: true },
  { label: "TCLE de cannabis incluído (Art. 38)", done: false },
];

/* ============================ ÁTOMOS ============================ */

function PatientBar() {
  return (
    <div className="flex items-center gap-3 rounded-[16px] bg-[#f9f9f9] px-4 py-2.5">
      <Avatar name="Maria Teste" seed="maria-teste" size="sm" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-caption font-medium text-ink">Maria Teste · 34a F</span>
        <span className="text-micro text-neutral-500">Diagnóstico: M54.5 · Dor lombar crônica</span>
      </div>
      <button className="flex shrink-0 items-center gap-1.5 text-micro text-neutral-500 hover:text-ink">
        <Icon name="user" size={14} /> Trocar paciente
      </button>
    </div>
  );
}

function TypeTabs({ value, onChange }: { value: DocType; onChange: (t: DocType) => void }) {
  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
      {DOC_TYPES.map((t) => {
        const on = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            aria-pressed={on}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-caption transition-colors",
              on ? "border-ink bg-ink text-paper" : "border-neutral-200 bg-paper text-neutral-600 hover:text-ink",
            )}
          >
            <Icon name={t.icon} size={15} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-3 rounded-[20px] bg-[#f9f9f9] p-4", className)}>{children}</div>;
}

/* ============================ EDITOR DE ITEM ============================ */

function ItemEditor({ med, onConfirm, onCancel }: { med: Med; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-neutral-300 bg-paper p-4">
      <div className="flex items-center gap-2">
        <Icon name={med.cannabis ? "capsule" : "capsule"} size={18} className="text-neutral-600" />
        <span className="min-w-0 flex-1 truncate text-caption font-medium text-ink">{med.name}</span>
        <Chip tone="muted">{med.type}</Chip>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Dose por tomada", "5 gotas"],
          ["Frequência / dia", "3× (8/8h)"],
          ["Duração (dias)", "30"],
          ["Via", "Oral"],
        ].map(([label, val]) => (
          <label key={label} className="flex flex-col gap-1">
            <Eyebrow>{label}</Eyebrow>
            <input
              defaultValue={val}
              className="rounded-[12px] border border-neutral-200 bg-paper px-3 py-2 text-caption text-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </label>
        ))}
      </div>
      {med.cannabis ? (
        <div className="flex items-center gap-2 rounded-[12px] bg-neutral-100 px-3 py-2">
          <Icon name="sparkles" size={15} className="text-neutral-500" />
          <span className="text-micro text-neutral-600">Cannabis · titulação start-low; computa CBD/THC mg/dia.</span>
        </div>
      ) : null}
      <div className="flex items-center gap-3 border-t border-neutral-200/70 pt-3">
        <span className="text-caption text-neutral-600">
          Computado: <strong className="text-ink">{med.cannabis ? "90 mg CBD/dia" : "75 mg/dia"}</strong>
        </span>
        <div className="flex flex-1 items-center justify-end gap-2">
          <WireButton variant="secondary" onClick={onCancel}>Cancelar</WireButton>
          <WireButton variant="primary" onClick={onConfirm}>Adicionar ao documento</WireButton>
        </div>
      </div>
    </div>
  );
}

/* ============================ FLUXOS POR TIPO ============================ */

function PrescricaoFlow({ items, setItems }: { items: Item[]; setItems: (f: (i: Item[]) => Item[]) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Med | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <SectionCard>
        <div className="flex h-11 items-center gap-2 rounded-full border border-neutral-200 bg-paper px-4">
          <Icon name="search" size={18} className="text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar medicamento no catálogo (33k)…"
            className="min-w-0 flex-1 bg-transparent text-caption text-ink placeholder:text-neutral-400 focus:outline-none"
          />
        </div>
        {SEARCH_SECTIONS.map((sec) => (
          <div key={sec.title} className="flex flex-col gap-1.5">
            <Eyebrow>{sec.title}</Eyebrow>
            {sec.items.map((m) => (
              <button
                key={m.name}
                type="button"
                onClick={() => setSelected(m)}
                className="flex items-center gap-3 rounded-[12px] bg-paper px-3 py-2 text-left transition-colors hover:bg-neutral-100"
              >
                <Icon name="capsule" size={18} className="text-neutral-500" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-caption font-medium text-ink">{m.name}</span>
                  <span className="truncate text-micro text-neutral-500">{m.ingredient} · {m.maker}</span>
                </div>
                {m.cannabis ? <Chip tone="inset">cannabis</Chip> : null}
                <span className="shrink-0 font-mono text-micro text-neutral-400">★ {m.count}×/12m</span>
              </button>
            ))}
          </div>
        ))}
      </SectionCard>

      {selected ? (
        <ItemEditor
          med={selected}
          onCancel={() => setSelected(null)}
          onConfirm={() => {
            setItems((prev) => [
              ...prev,
              { name: selected.name, cannabis: selected.cannabis, ai: false, posologia: "conforme editor", meta: selected.cannabis ? "90 mg CBD/dia" : "75 mg/dia", dispensar: "1 unidade" },
            ]);
            setSelected(null);
          }}
        />
      ) : null}

      <div className="flex flex-col gap-2">
        <Eyebrow>{items.length} item(ns) no documento</Eyebrow>
        {items.map((it, i) => (
          <div key={i} className="card-solid flex items-center gap-3 rounded-[14px] px-3 py-2.5">
            <Icon name={it.cannabis ? "heart-pulse" : "capsule"} size={18} className="text-neutral-500" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-caption font-medium text-ink">{it.name}</span>
                {it.ai ? <Chip tone="muted">IA</Chip> : null}
              </span>
              <span className="truncate text-micro text-neutral-500">{it.posologia} · {it.meta} · dispensar {it.dispensar}</span>
            </div>
            <button aria-label="Editar" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink">
              <Icon name="pencil" size={16} />
            </button>
            <button
              aria-label="Remover"
              onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink"
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))}
        {items.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-neutral-200 px-3 py-6 text-center text-caption text-neutral-400">
            Nenhum medicamento prescrito.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ExamesFlow() {
  return (
    <SectionCard>
      <div className="flex h-11 items-center gap-2 rounded-full border border-neutral-200 bg-paper px-4">
        <Icon name="search" size={18} className="text-neutral-400" />
        <input placeholder="Buscar exame (TUSS/LOINC)…" className="min-w-0 flex-1 bg-transparent text-caption text-ink placeholder:text-neutral-400 focus:outline-none" />
      </div>
      <Eyebrow>{EXAMS.length} exames selecionados</Eyebrow>
      {EXAMS.map((e) => (
        <div key={e} className="flex items-center gap-3 rounded-[12px] bg-paper px-3 py-2">
          <Icon name="test-tube" size={18} className="text-neutral-500" />
          <span className="min-w-0 flex-1 truncate text-caption text-ink">{e}</span>
          <button aria-label="Remover" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-ink">
            <Icon name="x" size={15} />
          </button>
        </div>
      ))}
    </SectionCard>
  );
}

function SimpleDocFlow({ type }: { type: DocType }) {
  const templates = SIMPLE_TEMPLATES[type] ?? ["Modelo padrão"];
  return (
    <SectionCard>
      <div className="flex items-center gap-3">
        <Eyebrow>Modelo</Eyebrow>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          {templates.map((t, i) => (
            <Chip key={t} tone={i === 0 ? "inset" : "muted"}>{t}</Chip>
          ))}
        </div>
      </div>
      <button className="flex items-center justify-center gap-2 rounded-[12px] border border-neutral-300 bg-paper py-2.5 text-caption font-medium text-ink hover:bg-neutral-100">
        <Icon name="sparkles" size={16} className="text-neutral-500" /> Sugestão Athena
      </button>
      <textarea
        rows={8}
        defaultValue={`Atesto, para os devidos fins, que o(a) paciente Maria Teste esteve sob meus cuidados…`}
        className="resize-none rounded-[12px] border border-neutral-200 bg-paper px-3 py-2 text-caption leading-relaxed text-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
      />
    </SectionCard>
  );
}

/* ============================ PREVIEW A4 + AÇÕES ============================ */

function A4Preview({ type, items, onSign, onSend }: { type: DocType; items: Item[]; onSign: () => void; onSend: () => void }) {
  const docLabel = DOC_TYPES.find((d) => d.key === type)?.label ?? "Documento";
  const hasCannabis = type === "prescricao" && items.some((i) => i.cannabis);
  const tabs = [docLabel, ...(hasCannabis ? ["TCLE Clínico (cannabis)"] : [])];
  const [tab, setTab] = useState(0);
  const blocked = CHECKLIST.some((c) => !c.done && c.label.includes("TCLE")) && hasCannabis;

  return (
    <div className="flex flex-col gap-3">
      {/* Abas do preview. */}
      <div className="flex items-center gap-2">
        {tabs.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(i)}
            className={cn(
              "rounded-full px-3 py-1.5 text-caption transition-colors",
              i === tab ? "bg-ink text-paper" : "bg-neutral-100 text-neutral-600 hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Papel A4. */}
      <div className="flex flex-col gap-4 rounded-[8px] border border-neutral-200 bg-paper p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3 border-b border-neutral-200 pb-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100">
            <Icon name="plus-medical" size={18} className="text-neutral-600" />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="font-display text-body font-medium text-ink">Clínica WeCann</span>
            <span className="text-micro text-neutral-500">Dra. Helena Prado · CRM-SP 123456</span>
          </div>
          <span className="text-micro text-neutral-400">19/06/2026</span>
        </div>

        {tab === 0 && type === "prescricao" ? (
          <ol className="flex flex-col gap-3">
            {items.map((it, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-mono text-caption text-neutral-400">{i + 1}.</span>
                <div className="flex flex-col">
                  <span className="text-caption font-medium text-ink">{it.name}</span>
                  <span className="text-caption text-neutral-600">{it.posologia} — dispensar {it.dispensar}</span>
                </div>
              </li>
            ))}
          </ol>
        ) : tab === 0 && type === "exames" ? (
          <ol className="flex flex-col gap-2">
            {EXAMS.map((e, i) => (
              <li key={e} className="flex gap-2 text-caption text-neutral-700">
                <span className="font-mono text-neutral-400">{i + 1}.</span> {e}
              </li>
            ))}
          </ol>
        ) : tab === 0 ? (
          <p className="text-caption leading-relaxed text-neutral-700 text-pretty">
            Atesto, para os devidos fins, que o(a) paciente Maria Teste, portador(a) do CID M54.5,
            esteve sob meus cuidados nesta data, necessitando de afastamento de suas atividades.
          </p>
        ) : (
          <div className="flex flex-col gap-2 text-caption leading-relaxed text-neutral-700">
            <p>Termo de Consentimento Livre e Esclarecido — uso de Cannabis medicinal (Art. 38).</p>
            <p className="text-neutral-500">Aceite eletrônico do paciente via WhatsApp (clickwrap + OTP). Sem assinatura do médico nesta aba.</p>
          </div>
        )}

        <div className="mt-2 flex flex-col items-center gap-1 border-t border-neutral-200 pt-4">
          <span className="h-8 w-40 border-b border-neutral-300" />
          <span className="text-micro text-neutral-400">Dra. Helena Prado · assinatura ICP-Brasil</span>
        </div>
      </div>

      {/* Checklist de completude (G11). */}
      <div className="flex flex-col gap-2 rounded-[16px] bg-[#f9f9f9] p-4">
        <Eyebrow>Checklist de completude</Eyebrow>
        {CHECKLIST.map((c) => {
          const ok = c.done || (!hasCannabis && c.label.includes("TCLE"));
          return (
            <div key={c.label} className="flex items-center gap-2">
              <Icon name={ok ? "check-circle" : "error-circle"} size={16} className={ok ? "text-neutral-500" : "text-critical"} />
              <span className={cn("text-caption", ok ? "text-neutral-600" : "text-critical")}>{c.label}</span>
            </div>
          );
        })}
      </div>

      {/* Ações. */}
      <div className="flex items-center gap-2">
        <WireButton variant="ghost" className="gap-2">
          <Icon name="printer" size={16} /> Imprimir
        </WireButton>
        <div className="flex flex-1 items-center justify-end gap-2">
          <WireButton variant="secondary" onClick={onSend} className="gap-2">
            <Icon name="send" size={16} /> Enviar WhatsApp
          </WireButton>
          <WireButton
            variant="primary"
            onClick={onSign}
            className={cn("gap-2", tab > 0 && "pointer-events-none opacity-40", blocked && "opacity-40")}
          >
            <Icon name="file-signature" size={16} /> {tab > 0 ? "TCLE: aceite do paciente" : "Revisar e assinar"}
          </WireButton>
        </div>
      </div>
    </div>
  );
}

function CenterModal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div onClick={onClose} aria-hidden className="absolute inset-0 bg-[#e6e6e4]/50 backdrop-blur-sm" />
      <div className="relative flex w-full max-w-[480px] flex-col gap-4 rounded-[24px] bg-paper p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-body-l font-medium text-ink">{title}</h2>
          <div className="flex flex-1 items-center justify-end">
            <button onClick={onClose} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink">
              <Icon name="x" size={20} />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================ TELA ============================ */

export function DocumentsCenter() {
  const [type, setType] = useState<DocType>("prescricao");
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [sign, setSign] = useState(false);
  const [send, setSend] = useState(false);

  return (
    <AppScreen>
      <ScreenHeader title="Documentos" subtitle="Gere, revise, assine e envie os documentos clínicos do paciente." />
      <PatientBar />
      <TypeTabs value={type} onChange={setType} />

      <div className="flex flex-wrap items-start gap-6">
        {/* Editor / busca. */}
        <div className="flex min-w-[320px] flex-1 flex-col gap-4">
          {type === "prescricao" ? (
            <PrescricaoFlow items={items} setItems={setItems} />
          ) : type === "exames" ? (
            <ExamesFlow />
          ) : (
            <SimpleDocFlow type={type} />
          )}
        </div>
        {/* Preview A4. */}
        <div className="flex min-w-[320px] flex-1 flex-col">
          <A4Preview type={type} items={items} onSign={() => setSign(true)} onSend={() => setSend(true)} />
        </div>
      </div>

      <CenterModal open={sign} title="Assinatura ICP-Brasil" onClose={() => setSign(false)}>
        <p className="text-caption text-neutral-600 text-pretty">
          Revise o documento e confirme a assinatura digital. Prescrições geram receita digital com QR
          de validação; o registro estruturado (RWE) é persistido automaticamente.
        </p>
        <label className="flex flex-col gap-1">
          <Eyebrow>Assinar como</Eyebrow>
          <div className="flex items-center gap-2 rounded-[12px] border border-neutral-200 bg-paper px-3 py-2 text-caption text-ink">
            <Icon name="user" size={16} className="text-neutral-500" /> Dra. Helena Prado · CRM-SP 123456
          </div>
        </label>
        <div className="flex items-center justify-end gap-2 border-t border-neutral-200/70 pt-3">
          <WireButton variant="secondary" onClick={() => setSign(false)}>Cancelar</WireButton>
          <WireButton variant="primary" onClick={() => setSign(false)}>Assinar documento</WireButton>
        </div>
      </CenterModal>

      <CenterModal open={send} title="Enviar ao paciente" onClose={() => setSend(false)}>
        <label className="flex flex-col gap-1">
          <Eyebrow>WhatsApp do paciente</Eyebrow>
          <input defaultValue="(11) 98765-4321" className="rounded-[12px] border border-neutral-200 bg-paper px-3 py-2 text-caption text-ink focus:outline-none focus:ring-2 focus:ring-ink/10" />
        </label>
        <p className="flex items-start gap-2 rounded-[12px] bg-neutral-100 p-3 text-micro text-neutral-600">
          <Icon name="shield" size={15} className="mt-0.5 text-neutral-500" />
          Ao enviar, o documento é assinado e torna-se imutável (hash SHA-256).
        </p>
        <div className="flex items-center justify-end gap-2 border-t border-neutral-200/70 pt-3">
          <WireButton variant="secondary" onClick={() => setSend(false)}>Cancelar</WireButton>
          <WireButton variant="primary" onClick={() => setSend(false)}>Assinar e enviar</WireButton>
        </div>
      </CenterModal>
    </AppScreen>
  );
}
