import {
  Home, Sprout, BookOpenText, BookHeart, Pill, Stethoscope, FlaskConical, CalendarDays,
  CircleHelp, LineChart, ClipboardList, FolderOpen,
  Image, Trophy, Heart, Users, Palette, UsersRound,
} from "lucide-react";

// Itens do menu principal — Etapas 1, 2 e 3 do escopo do projeto.
export const NAV_ITEMS = [
  { href: "/", label: "Início", emoji: "🏠", icon: Home },
  { href: "/jornada", label: "Minha Jornada", emoji: "🌱", icon: Sprout },
  { href: "/minha-historia", label: "Minha História", emoji: "📜", icon: BookOpenText },
  { href: "/diario", label: "Diário", emoji: "📖", icon: BookHeart },
  { href: "/tratamento", label: "Tratamento", emoji: "💊", icon: Pill },
  { href: "/sintomas", label: "Sintomas", emoji: "🩺", icon: Stethoscope },
  { href: "/exames", label: "Exames", emoji: "🧪", icon: FlaskConical },
  { href: "/agenda", label: "Agenda", emoji: "📅", icon: CalendarDays },
  { href: "/duvidas", label: "Minhas Dúvidas", emoji: "❓", icon: CircleHelp },
  { href: "/evolucao", label: "Minha Evolução", emoji: "📈", icon: LineChart },
  { href: "/resumo", label: "Resumo para Consulta", emoji: "📋", icon: ClipboardList },
  { href: "/memorias", label: "Memórias", emoji: "📸", icon: Image },
  { href: "/conquistas", label: "Conquistas", emoji: "🏆", icon: Trophy },
  { href: "/mural", label: "Mural", emoji: "💌", icon: Heart },
  { href: "/documentos", label: "Documentos", emoji: "📂", icon: FolderOpen },
  { href: "/rede-apoio", label: "Minha Rede de Apoio", emoji: "🤍", icon: Users },
  { href: "/carinhos", label: "Carinhos", emoji: "🎨", icon: Palette },
  { href: "/pessoas", label: "Pessoas", emoji: "👪", icon: UsersRound, somenteAdmin: true },
];

// Barra inferior no mobile — só os principais atalhos, com o botão central
// de registro rápido.
export const MOBILE_NAV_ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/diario", label: "Diário", icon: BookHeart },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/jornada", label: "Jornada", icon: Sprout },
];
