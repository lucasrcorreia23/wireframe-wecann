"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { WireBadge, WireButton, Eyebrow } from "@/components/ui";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { BackButton } from "@/components/ui/BackButton";
import { ScrollFade } from "@/components/ui/ScrollFade";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, prefersReducedMotion } from "@/lib/motion";
import type { ScreenProps } from "./index";

// Fade de overlays da chamada — oculto, surge no hover do grupo (vídeo ou palco).
const CALL_FADE =
  "opacity-0 transition-opacity duration-300 group-hover:opacity-100";

// `consult` — Tela de consulta do paciente. 3 colunas sobre o mundo 3D:
//  • Esquerda: contexto do paciente (maior) + anamnese da sessão (rótulo em cima
//    do valor; toggle Anamnese ↔ Exame físico full-width; rows rolam com fade).
//  • Centro (mais largo): a chamada DOMINA (~2/3) e, abaixo, notas compactas do
//    médico. Controles/overlays da chamada só aparecem no hover (modo cinema).
//  • Direita: Athena (copiloto) — globo, transcrição, insights, disclaimer.
// Tudo em vidro/neutros; gravidade por peso (WireBadge), nunca por matiz (§2.1).
// Scroll interno nunca corta bruto: usa `scroll-fade-y` (regra de plataforma).
export function ConsultScreen({ onContinue }: ScreenProps) {
  return (
    <div
      className="grid h-screen w-full max-w-[1240px] items-stretch gap-4 pt-24 pb-12"
      style={{
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1.6fr) minmax(0,1fr)",
      }}
    >
      {/* Esquerda — contexto do paciente + anamnese da sessão. */}
      <div className="orbit-pane flex min-h-0 min-w-0 flex-col gap-4">
        <PatientHeader />
        <Anamnese />
      </div>

      {/* Centro — chamada em foco + notas do médico. */}
      <div className="orbit-pane flex min-h-0 min-w-0 flex-col gap-4">
        <CallScreen onEnd={onContinue} />
        <NotesBox />
      </div>

      {/* Direita — copiloto Athena (sem a tela da consulta). */}
      <AthenaPanel />
    </div>
  );
}

/* ============================ COLUNA ESQUERDA ============================ */

// Header horizontal: apenas contexto do paciente (sem médico/qualidade). Maior
// presença — avatar e nome ampliados.
function PatientHeader() {
  return (
    <ModuleCard className="shrink-0 gap-3.5 px-5 pb-5 pt-4">
      <div className="flex items-start gap-3.5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/50 bg-paper/60 font-display text-title font-medium text-ink">
          MC
        </span>
        <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
          <span className="truncate font-display text-title font-medium leading-tight text-ink">
            Marina Castro
          </span>
          <span className="font-mono text-micro text-neutral-500">
            48a · F · 64kg
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <WireBadge>Fibromialgia</WireBadge>
        <WireBadge tone="mid">Dor crônica</WireBadge>
        <WireBadge tone="hard">Alergia · Dipirona</WireBadge>
      </div>
    </ModuleCard>
  );
}

const ANAMNESE_VIEWS = [
  { key: "anamnese", label: "Anamnese", icon: "bx-notepad" },
  { key: "ef", label: "Exame físico", icon: "bx-pulse" },
] as const;

// Anamnese da sessão. Título único + toggle full-width; só as rows rolam (fade).
function Anamnese() {
  const [view, setView] = useState<(typeof ANAMNESE_VIEWS)[number]["key"]>(
    "anamnese",
  );

  return (
    <ModuleCard title="Anamnese da sessão" className="min-h-0 flex-1">
      {/* Toggle segmentado full-width. */}
      <div className="grid shrink-0 grid-cols-2 gap-1 rounded-full bg-white/40 p-1">
        {ANAMNESE_VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            aria-pressed={view === v.key}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 font-mono text-micro uppercase tracking-[0.08em] transition-colors duration-[180ms]",
              view === v.key
                ? "bg-paper text-ink shadow-sm"
                : "text-neutral-500 hover:text-neutral-700",
            )}
          >
            <i className={cn("bx text-sm", v.icon)} />
            {v.label}
          </button>
        ))}
      </div>

      {/* Conteúdo rolável com esvanecer (rows são texto/glass-frost — seguro).
          driveOrb: rolar o prontuário move a orb 3D atrás (chamada fica fixa). */}
      <ScrollFade watch={view} driveOrb className="min-h-0 flex-1">
        {view === "anamnese" ? <AnamneseContent /> : <ExameFisicoContent />}
      </ScrollFade>
    </ModuleCard>
  );
}

// Linha empilhada: rótulo (mono micro) EM CIMA, valor (caption) embaixo.
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-dashed border-white/50 py-3 first:pt-0 last:border-0">
      <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
        {label}
      </span>
      <div className="text-caption leading-relaxed text-neutral-700">
        {children}
      </div>
    </div>
  );
}

function AnamneseContent() {
  return (
    <div className="flex flex-col">
      <Row label="Identificação">
        <div className="flex flex-wrap gap-1.5">
          <WireBadge>48a · F</WireBadge>
          <WireBadge>Aposentada</WireBadge>
          <WireBadge>Florianópolis/SC</WireBadge>
        </div>
      </Row>
      <Row label="Queixa · HMA">
        Dor lombar refratária há 14 meses, pior à noite e ao frio; prejudica o
        sono e a rotina. Busca reduzir opioide.
      </Row>
      <Row label="Sono">10h na cama · sono fragmentado · 3-4 despertares/noite</Row>
      <Row label="Medicações">
        <ul className="font-mono text-caption text-neutral-700">
          <li>Tramadol 50mg · 2×/dia</li>
          <li>Amitriptilina 25mg · noite</li>
        </ul>
      </Row>
      <Row label="Comorbidades">
        <div className="flex flex-wrap gap-1.5">
          <WireBadge>M79.7 · Fibromialgia</WireBadge>
          <WireBadge tone="mid">F41.1 · Ansiedade</WireBadge>
        </div>
      </Row>
      <Row label="Escalas">
        <div className="flex flex-col gap-1.5">
          <ScoreCard name="BPI dor" value="6/10" note="moderada-grave" />
          <ScoreCard name="PSQI sono" value="13" note="qualidade ruim" tone="mid" />
        </div>
      </Row>
      <Row label="Plano · obs.">
        Titular canabinoide · desmame gradual de opioide · reforçar higiene do
        sono · retorno em 30 dias.
      </Row>
    </div>
  );
}

function ExameFisicoContent() {
  return (
    <div className="flex flex-col">
      <Row label="Sinais vitais">
        <span className="font-mono text-caption text-neutral-700">
          PA 128/82 · FC 76 · FR 16 · SpO₂ 98% · Tax 36,4°C
        </span>
      </Row>
      <Row label="Antropometria">
        <div className="flex flex-wrap gap-1.5">
          <WireBadge>Peso 64kg</WireBadge>
          <WireBadge>IMC 24,1</WireBadge>
        </div>
      </Row>
      <Row label="Aparelhos">
        <div className="flex flex-wrap gap-1.5">
          <WireBadge tone="soft">Cardio normal</WireBadge>
          <WireBadge tone="soft">Resp normal</WireBadge>
          <WireBadge tone="soft">Abd normal</WireBadge>
        </div>
      </Row>
      <Row label="Musculoesq.">
        <div className="flex flex-wrap gap-1.5">
          <WireBadge tone="mid">11/18 tender points</WireBadge>
          <WireBadge tone="mid">Lombar dolorosa</WireBadge>
        </div>
      </Row>
      <Row label="Neurológico">
        Força e sensibilidade preservadas · sem déficit focal
      </Row>
      <Row label="Red flags">
        <div className="flex items-start gap-2">
          <WireBadge tone="hard">Atenção</WireBadge>
          <span>Investigar interação serotoninérgica antes de ajustar dose.</span>
        </div>
      </Row>
    </div>
  );
}

function ScoreCard({
  name,
  value,
  note,
  tone = "neutral",
}: {
  name: string;
  value: string;
  note: string;
  tone?: "neutral" | "mid";
}) {
  return (
    <div className="glass-frost-inner flex items-center gap-3 rounded-xl px-3 py-2">
      <span className="min-w-[64px] font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
        {name}
      </span>
      <span
        className={cn(
          "font-mono text-body font-medium",
          tone === "mid" ? "text-state-mid" : "text-ink",
        )}
      >
        {value}
      </span>
      <span className="ml-auto text-micro text-neutral-500">{note}</span>
    </div>
  );
}

/* ============================ COLUNA CENTRAL ============================ */

// Botão de controle in-call (redondo, vidro). `danger` = encerrar.
function CallControl({
  icon,
  label,
  active = false,
  danger = false,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-11 w-11 place-items-center rounded-full border backdrop-blur transition-colors duration-[180ms]",
        danger
          ? "border-transparent bg-ink text-paper hover:bg-neutral-800"
          : active
            ? "border-white/60 bg-paper/85 text-ink"
            : "border-white/30 bg-white/15 text-paper/90 hover:bg-white/25",
      )}
    >
      <i className={cn("bx text-xl", icon)} />
    </button>
  );
}

// Fileira de controles in-call — reutilizada na barra normal e no modo imersivo.
function CallControlBar({
  mic,
  cam,
  transcribing,
  fullscreen,
  onToggleMic,
  onToggleCam,
  onToggleTranscribing,
  onToggleFullscreen,
  onEnd,
  className,
}: {
  mic: boolean;
  cam: boolean;
  transcribing: boolean;
  fullscreen: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleTranscribing: () => void;
  onToggleFullscreen: () => void;
  onEnd?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <CallControl
        icon={mic ? "bx-microphone" : "bx-microphone-off"}
        label="Microfone"
        active={mic}
        onClick={onToggleMic}
      />
      <CallControl
        icon={cam ? "bx-video" : "bx-video-off"}
        label="Câmera"
        active={cam}
        onClick={onToggleCam}
      />
      <CallControl icon="bx-desktop" label="Compartilhar tela" />
      <CallControl
        icon="bx-captions"
        label="Transcrição"
        active={transcribing}
        onClick={onToggleTranscribing}
      />
      <CallControl icon="bx-message-rounded-dots" label="Chat" />
      <CallControl
        icon={fullscreen ? "bx-exit-fullscreen" : "bx-fullscreen"}
        label="Tela cheia"
        active={fullscreen}
        onClick={onToggleFullscreen}
      />
      <CallControl
        icon="bx-phone-off"
        label="Encerrar chamada"
        danger
        onClick={onEnd}
      />
    </div>
  );
}

// Campo de ditar nota (mock — wireframe).
function NoteInput({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "glass-frost-inner flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-4 pr-2",
        className,
      )}
    >
      <span className="flex-1 truncate text-caption text-neutral-400">
        Anotar algo durante a sessão…
      </span>
      <span className="inline-flex items-center gap-1.5 font-mono text-micro text-neutral-500">
        <i className="bx bx-microphone text-base" /> Ditar
      </span>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-paper">
        →
      </span>
    </div>
  );
}

// Overlay imersivo em portal — palco cinematográfico + notas fixas embaixo.
// A transição (entrar/sair) é um clip-path `inset` que cresce do retângulo da
// chamada até a viewport inteira (sem distorcer o conteúdo e sem transform no
// `group` → o hover via `group-hover` continua intacto). Proxy + onUpdate p/
// montar a string numericamente (sempre confiável, sem depender do parser de
// strings do GSAP) e sem ref-guard (StrictMode-safe: a animação pode reexecutar).
function ImmersiveCall({
  originRect,
  isClosing,
  onExitComplete,
  mic,
  cam,
  transcribing,
  onToggleMic,
  onToggleCam,
  onToggleTranscribing,
  onClose,
  onEnd,
}: {
  originRect: DOMRect;
  isClosing: boolean;
  onExitComplete: () => void;
  mic: boolean;
  cam: boolean;
  transcribing: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleTranscribing: () => void;
  onClose: () => void;
  onEnd?: () => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useMemo(() => prefersReducedMotion(), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;

      // p = 0 → tela cheia (inset 0); p = 1 → recolhido no retângulo da chamada.
      const apply = (p: number) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const top = originRect.top * p;
        const right = (vw - originRect.right) * p;
        const bottom = (vh - originRect.bottom) * p;
        const left = originRect.left * p;
        const radius = 18 * p;
        const value = `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
        stage.style.setProperty("clip-path", value);
        stage.style.setProperty("-webkit-clip-path", value);
      };

      // Reduced-motion: sem clip, só um fade suave.
      if (reduce) {
        apply(0);
        if (isClosing) {
          gsap.to(stage, {
            opacity: 0,
            duration: DURATION.crossfade,
            onComplete: onExitComplete,
          });
        } else {
          gsap.fromTo(
            stage,
            { opacity: 0 },
            { opacity: 1, duration: DURATION.crossfade },
          );
        }
        return;
      }

      const proxy = { p: isClosing ? 0 : 1 };
      apply(proxy.p); // estado inicial antes do paint (sem flash)

      gsap.to(proxy, {
        p: isClosing ? 1 : 0,
        duration: DURATION.travel * 0.6,
        ease: isClosing ? "power2.in" : EASE.panel,
        onUpdate: () => apply(proxy.p),
        onComplete: isClosing ? onExitComplete : undefined,
      });
    },
    { scope: stageRef, dependencies: [isClosing] },
  );

  return (
    <div
      ref={stageRef}
      className="group fixed inset-0 z-[60] h-screen w-screen overflow-hidden bg-neutral-900"
    >
      {/* Palco — placeholder do paciente (sempre visível). */}
      <div className="absolute inset-0 grid place-items-center">
        <span className="grid h-28 w-28 place-items-center rounded-full border border-paper/25 bg-paper/10 font-display text-display-l text-paper/80">
          MC
        </span>
      </div>

      {/* Self-view (PiP) — topo-direita (hover). */}
      <div
        className={cn(
          "absolute right-6 top-6 grid h-20 w-28 place-items-center rounded-xl border border-white/30 bg-neutral-700/90 text-paper/70",
          CALL_FADE,
        )}
      >
        <i className="bx bxs-user text-2xl" />
        <span className="absolute bottom-1 left-1.5 font-mono text-[10px] text-paper/60">
          Você
        </span>
      </div>

      {/* Nome do paciente — rodapé-esquerda (hover). */}
      <span
        className={cn(
          "absolute bottom-6 left-6 font-mono text-micro text-paper/70",
          CALL_FADE,
        )}
      >
        Marina Castro
      </span>

      {/* Base — controles (hover) + faixa de notas (sempre visível). */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-6">
        <div className="flex w-full max-w-[760px] flex-col gap-3">
          <CallControlBar
            mic={mic}
            cam={cam}
            transcribing={transcribing}
            fullscreen
            onToggleMic={onToggleMic}
            onToggleCam={onToggleCam}
            onToggleTranscribing={onToggleTranscribing}
            onToggleFullscreen={onClose}
            onEnd={onEnd}
            className={cn(
              CALL_FADE,
              "pointer-events-none group-hover:pointer-events-auto",
            )}
          />
          {/* Faixa de notas — quase o empty state da NotesBox, porém com mais
              contraste/polimento para se destacar sobre o fundo escuro. */}
          <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-[28px] border border-white/60 bg-paper/85 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
            <div className="flex flex-col items-center gap-1 text-center">
              <i className="bx bx-note text-3xl text-neutral-400" />
              <span className="font-display text-body-l font-medium text-ink">
                Notas clínicas
              </span>
              <span className="text-caption text-neutral-500">
                Só você vê estas anotações pessoais.
              </span>
            </div>
            <NoteInput className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// A chamada em foco. Controles + overlays só aparecem no hover (modo cinema).
function CallScreen({ onEnd }: { onEnd?: () => void }) {
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [transcribing, setTranscribing] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  const showImmersive = fullscreen || isClosing;

  const handleToggleFullscreen = useCallback(() => {
    if (fullscreen && !isClosing) {
      setIsClosing(true);
      return;
    }
    if (!fullscreen) {
      const rect = videoRef.current?.getBoundingClientRect();
      if (rect) setOriginRect(rect);
      setFullscreen(true);
    }
  }, [fullscreen, isClosing]);

  const handleExitComplete = useCallback(() => {
    setFullscreen(false);
    setIsClosing(false);
    setOriginRect(null);
  }, []);

  const handleCloseImmersive = useCallback(() => {
    if (!isClosing) setIsClosing(true);
  }, [isClosing]);

  return (
    <ModuleCard className="flex-[2] min-h-0 gap-2">
      <div className="flex min-h-9 shrink-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <BackButton />
          <h2 className="font-display text-title font-medium text-ink">
            Tela da consulta
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Compartilhar link da consulta"
            title="Compartilhar link da consulta"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neutral-300 bg-paper text-ink transition-colors hover:border-neutral-500"
          >
            <i className="bx bx-link text-xl" />
          </button>
          <WireButton variant="primary" size="sm" onClick={onEnd}>
            Encerrar
          </WireButton>
        </div>
      </div>

      <div
        ref={videoRef}
        className={cn(
          "group relative min-h-0 flex-1 overflow-hidden rounded-[18px] border border-white/40 bg-neutral-800",
          showImmersive && "opacity-0",
        )}
      >
        {/* Placeholder do paciente (sempre visível). */}
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid h-20 w-20 place-items-center rounded-full border border-paper/25 bg-paper/10 font-display text-display-m text-paper/80">
            MC
          </span>
        </div>

        {/* Self-view (PiP) — topo-direita, não colide com a barra (hover). */}
        <div
          className={cn(
            "absolute right-3 top-3 grid h-16 w-24 place-items-center rounded-xl border border-white/30 bg-neutral-700/90 text-paper/70",
            CALL_FADE,
          )}
        >
          <i className="bx bxs-user text-2xl" />
          <span className="absolute bottom-1 left-1.5 font-mono text-[10px] text-paper/60">
            Você
          </span>
        </div>

        {/* Nome do paciente — rodapé-esquerda (hover). */}
        <span
          className={cn(
            "absolute bottom-4 left-3 font-mono text-micro text-paper/70",
            CALL_FADE,
          )}
        >
          Marina Castro
        </span>

        {/* Barra de controles — rodapé-centro (hover). */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-3 pb-3 pt-10 group-hover:pointer-events-auto",
            CALL_FADE,
          )}
        >
          <CallControlBar
            mic={mic}
            cam={cam}
            transcribing={transcribing}
            fullscreen={fullscreen}
            onToggleMic={() => setMic((v) => !v)}
            onToggleCam={() => setCam((v) => !v)}
            onToggleTranscribing={() => setTranscribing((v) => !v)}
            onToggleFullscreen={handleToggleFullscreen}
            onEnd={onEnd}
          />
        </div>
      </div>

      {showImmersive &&
        originRect &&
        typeof document !== "undefined" &&
        createPortal(
          <ImmersiveCall
            originRect={originRect}
            isClosing={isClosing}
            onExitComplete={handleExitComplete}
            mic={mic}
            cam={cam}
            transcribing={transcribing}
            onToggleMic={() => setMic((v) => !v)}
            onToggleCam={() => setCam((v) => !v)}
            onToggleTranscribing={() => setTranscribing((v) => !v)}
            onClose={handleCloseImmersive}
            onEnd={onEnd}
          />,
          document.body,
        )}
    </ModuleCard>
  );
}

// Box de notas livres do médico — empty state (ícone + título centralizado) com
// o campo de digitar fixo embaixo. Fica abaixo da chamada (fixa).
function NotesBox() {
  return (
    <ModuleCard className="flex-1 min-h-0">
      {/* Empty state — ícone + título serifado + privacidade, centralizado no box. */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5 px-4 text-center text-neutral-500">
        <i className="bx bx-note text-3xl text-neutral-400" />
        <span className="font-display text-body-l font-medium text-ink">
          Notas clínicas
        </span>
        <span className="max-w-[34ch] text-caption text-neutral-500">
          Só você vê estas anotações pessoais.
        </span>
      </div>

      <NoteInput className="mt-1" />
    </ModuleCard>
  );
}

/* ============================ COLUNA DIREITA ============================ */

const INSIGHTS = [
  { tag: "Pergunta-chave", text: "Investigar qualidade do sono e despertares." },
  { tag: "Alerta", text: "Interação: tramadol + amitriptilina (serotoninérgica)." },
  { tag: "CID sugerido", text: "M79.7 · fibromialgia." },
  { tag: "Literatura", text: "Canabinoide adjuvante reduz dor noturna (coorte 2023)." },
];

// Athena — copiloto clínico docado à direita (sem a tela da consulta, que vive
// no centro). Mantém o slot do globo p/ o AiGlobe billboardar atrás.
function AthenaPanel() {
  return (
    <aside className="orbit-pane glass-panel-blue backdrop-blur-2xl flex min-h-0 flex-col gap-4 rounded-[28px] p-5">
      {/* Slot do globo — área transparente onde o globo 3D aparece. */}
      <div className="relative h-44 shrink-0">
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <p className="font-display text-title font-medium text-ink">Athena</p>
          <p className="text-caption text-neutral-600">Copiloto clínico</p>
        </div>
      </div>

     

      {/* Insights / alertas contextuais — esvanecem ao rolar e movem a orb. */}
      <ScrollFade driveOrb className="flex min-h-0 flex-1 flex-col gap-2">
        <Eyebrow>Insights</Eyebrow>
        <ul className="flex flex-col gap-2">
          {INSIGHTS.map((it) => (
            <li
              key={it.tag}
              className="glass-frost-inner flex flex-col gap-1 rounded-2xl px-3 py-2.5"
            >
              <span className="font-mono text-micro uppercase tracking-[0.1em] text-neutral-500">
                {it.tag}
              </span>
              <span className="text-caption text-neutral-700">{it.text}</span>
            </li>
          ))}
        </ul>
      </ScrollFade>

      {/* Disclaimer. */}
      <div className="flex shrink-0 items-start gap-2 border-t border-white/50 pt-3">
        <i className="bx bx-shield-quarter mt-0.5 text-base text-neutral-400" />
        <p className="text-micro leading-relaxed text-neutral-500">
          <strong className="font-medium text-neutral-600">
            Athena é assistiva
          </strong>{" "}
          · decisão final do médico · sugestões em log de auditoria · CFM
          2.314/22 · LGPD.
        </p>
      </div>
    </aside>
  );
}
