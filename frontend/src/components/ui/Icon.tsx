import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Buildings,
  ChatCircleText,
  Check,
  ClockCounterClockwise,
  Compass,
  DownloadSimple,
  EnvelopeSimple,
  Eye,
  FileText,
  GraduationCap,
  Globe,
  Heart,
  List,
  ListChecks,
  Lock,
  MagnifyingGlass,
  MapPin,
  PaperPlaneTilt,
  PencilSimple,
  Play,
  Plus,
  SealCheck,
  ShieldCheck,
  SignOut,
  SquaresFour,
  Trash,
  Translate,
  Tray,
  User,
  UsersThree,
  Warning,
  X,
  type Icon as PhosphorIcon,
  type IconWeight,
} from '@phosphor-icons/react';
import type { CSSProperties } from 'react';

/** Premium Phosphor ikonkalar (duotone — eki reńli). Atlar eski ikonka toplamı menen birdey. */
const ICONS = {
  arrowRight: ArrowRight,
  arrowUpRight: ArrowUpRight,
  cap: GraduationCap,
  compass: Compass,
  users: UsersThree,
  briefcase: Briefcase,
  heart: Heart,
  checklist: ListChecks,
  check: Check,
  search: MagnifyingGlass,
  download: DownloadSimple,
  plus: Plus,
  play: Play,
  globe: Globe,
  shield: ShieldCheck,
  close: X,
  menu: List,
  lock: Lock,
  alert: Warning,
  send: PaperPlaneTilt,
  chat: ChatCircleText,
  language: Translate,
  verified: SealCheck,
  pin: MapPin,
  grid: SquaresFour,
  user: User,
  logout: SignOut,
  eye: Eye,
  trash: Trash,
  edit: PencilSimple,
  inbox: Tray,
  file: FileText,
  mail: EnvelopeSimple,
  building: Buildings,
  clock: ClockCounterClockwise,
} satisfies Record<string, PhosphorIcon>;

export type IconName = keyof typeof ICONS;

/** Kishi sızıqlı belgiler (strelka, galochka…) — duotone emes, qalıń sızıq anıqraq kórinedi */
const BOLD = new Set<IconName>(['arrowRight', 'arrowUpRight', 'check', 'plus', 'close', 'menu', 'play']);

export const Icon = ({
  name,
  size = 20,
  weight,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  weight?: IconWeight;
  /** Eski API menen sáykeslik ushın qabıllanadı, Phosphor'da isletilmeydi */
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}) => {
  const Cmp = ICONS[name];
  return <Cmp size={size} weight={weight ?? (BOLD.has(name) ? 'bold' : 'duotone')} className={className} style={style} aria-hidden focusable="false" />;
};
