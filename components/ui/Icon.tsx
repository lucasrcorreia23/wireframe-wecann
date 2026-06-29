import {
  type LucideIcon,
  Activity, AlarmClock, ArrowLeft, ArrowRight, BarChart3, Bot, Brain, BookOpen,
  Calendar, CalendarCheck, CalendarClock, CalendarDays, CalendarPlus, CalendarX,
  Captions, Check, CheckCheck, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  CircleAlert, CircleCheck, CircleHelp, ClipboardCheck, ClipboardList, Clock,
  Contact, Eye, EllipsisVertical, File, FileSignature, FileText, Flag, FlaskConical,
  GitCommitHorizontal, GitCompare, HandHeart, Handshake, Heart, HeartPulse, Home,
  IdCard, Inbox, Layers, LayoutGrid, Lightbulb, LineChart, Link, List, ListChecks,
  Loader2, LogOut, Mail, Maximize, Maximize2, MapPin, Mic, MicOff, Microscope,
  Minimize, Minimize2, Monitor, MessageCircle, MessageSquare, MessageSquareText,
  NotebookPen, Paperclip, Pen, Pencil, PersonStanding, Phone, PhoneOff, Pill, Play,
  Plus, Printer, RefreshCw, Scan, Search, Send, Shield, ShieldCheck, SlidersHorizontal,
  Smile, Sparkles, Star, StickyNote, Stethoscope, Target, TestTube, TrendingUp,
  Trash2, TriangleAlert, User, Users, UserPlus, Video, VideoOff, Wrench, X, Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";

// Ícone = SVG INLINE (lucide). Cola no Figma como vetor de verdade (ao contrário de
// fontes de ícone — Boxicons/Material — que vinham como caixa/texto). Traço fino
// (~1.75) p/ o look sóbrio. `name` aceita o nome canônico OU o antigo "bx-xxx"
// (o prefixo é removido), então arrays de dados com icon:"bx-capsule" seguem válidos.
const MAP: Record<string, LucideIcon> = {
  // navegação / chrome
  search: Search, "chevron-down": ChevronDown, "chevron-up": ChevronUp,
  "chevron-left": ChevronLeft, "chevron-right": ChevronRight,
  "arrow-back": ArrowLeft, "right-arrow-alt": ArrowRight,
  "expand-alt": Maximize2, "collapse-alt": Minimize2, fullscreen: Maximize,
  "exit-fullscreen": Minimize, "dots-vertical-rounded": EllipsisVertical,
  "home-alt": Home, "log-out": LogOut, "slider-alt": SlidersHorizontal,
  "grid-alt": LayoutGrid, "list-ul": List, "list-check": ListChecks,
  // ações
  check: Check, "check-double": CheckCheck, "check-circle": CircleCheck,
  "check-shield": ShieldCheck, x: X, plus: Plus, pencil: Pencil, edit: Pencil,
  pen: Pen, send: Send, paperclip: Paperclip, refresh: RefreshCw, play: Play,
  show: Eye, link: Link, trash: Trash2, printer: Printer, microphone: Mic,
  "microphone-off": MicOff,
  // pessoas / paciente
  group: Users, user: User, "user-plus": UserPlus, "id-card": IdCard,
  "article_person": Contact, contact: Contact,
  // comunicação
  envelope: Mail, message: MessageSquare, chat: MessageSquare,
  "message-square-dots": MessageSquare, "message-square-detail": MessageSquareText,
  "message-rounded-dots": MessageCircle, whatsapp: MessageCircle, map: MapPin,
  phone: Phone, "phone-off": PhoneOff,
  video: Video, "video-off": VideoOff, video_camera_front: Video,
  desktop: Monitor, captions: Captions, inbox: Inbox,
  // clínico / dados
  capsule: Pill, medication: Pill, prescriptions: Pill, "plus-medical": Stethoscope,
  "test-tube": TestTube, science: FlaskConical, scan: Scan, body: PersonStanding,
  healing: HeartPulse, "heart-pulse": HeartPulse, microscope: Microscope,
  clipboard: ClipboardList, assignment: ClipboardList, "assignment_turned_in": ClipboardCheck,
  detail: ClipboardList, notepad: NotebookPen, note: StickyNote,
  file: FileText, "file-blank": File, description: FileText, "file-signature": FileSignature,
  "book-open": BookOpen, wrench: Wrench, "hand-heart": HandHeart, heart: Heart,
  // tempo / agenda
  calendar: Calendar, "calendar-check": CalendarCheck, "calendar-plus": CalendarPlus,
  calendar_month: CalendarDays, event: Calendar, event_note: CalendarDays,
  event_busy: CalendarX, "calendar-clock": CalendarClock, "alarm-clock": AlarmClock,
  time: Clock, "time-five": Clock, clock: Clock, timeline: Activity,
  // métricas / IA
  bot: Bot, brain: Brain, neurology: Brain, insights: Sparkles, sparkles: Sparkles,
  pulse: Activity, "line-chart": LineChart, "trending-up": TrendingUp,
  trending_up: TrendingUp, "bar-chart-alt-2": BarChart3, "git-commit": GitCommitHorizontal,
  "git-compare": GitCompare, target: Target, "target-lock": Target, bulb: Lightbulb,
  star: Star, layers: Layers, collection: Layers, handshake: Handshake,
  // status / alertas
  error: TriangleAlert, warning: TriangleAlert, "error-circle": CircleAlert,
  help: CircleHelp, flag: Flag, shield: Shield, smile: Smile, loader: Loader2,
  bolt: Zap, "bolt-circle": Zap,
};

export function Icon({
  name,
  size = 18,
  strokeWidth = 1.75,
  className,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const key = name.replace(/^bx-/, "");
  const C = MAP[key] ?? CircleHelp;
  return <C size={size} strokeWidth={strokeWidth} aria-hidden className={cn("shrink-0", className)} />;
}
