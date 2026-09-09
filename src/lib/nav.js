import {
  Home, Sprout, BookHeart, Pill, Stethoscope, FlaskConical, CalendarDays,
  CircleHelp, LineChart, ClipboardList, FolderOpen,
} from "lucide-react";

// Itens do menu principal — Etapa 1 (MVP) + Etapa 2 do escopo do projeto.
// Memórias, Conquistas, Mural e Rede de apoio entram na Etapa 3.
export const NAV_ITEMS = [
  { href: "/", label: "Início", emoji: "🏠", icon: Home },
  { href: "/jornada", label: "Minha Jornada", emoji: "🌱", icon: Sprout },
  { href: "/diario", label: "Diário", emoji: "📖", icon: BookHeart },
  { href: "/tratamento", label: "Tratamento", emoji: "💊", icon: Pill },
  { href: "/sintomas", label: "Sintomas", emoji: "🩺", icon: Stethoscope },
  { href: "/exames", label: "Exames", emoji: "🧪", icon: FlaskConical },
  { href: "/agenda", label: "Agenda", emoji: "📅", icon: CalendarDays },
  { href: "/duvidas", label: "Minhas Dúvidas", emoji: "❓", icon: CircleHelp },
  { href: "/evolucao", label: "Minha Evolução", emoji: "📈", icon: LineChart },
  { href: "/resumo", label: "Resumo para Consulta", emoji: "📋", icon: ClipboardList },
  { href: "/documentos", label: "Documentos", emoji: "📂", icon: FolderOpen },
];

// Barra inferior no mobile — só os principais atalhos, com o botão central
// de registro rápido.
export const MOBILE_NAV_ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/diario", label: "Diário", icon: BookHeart },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/jornada", label: "Jornada", icon: Sprout },
];
