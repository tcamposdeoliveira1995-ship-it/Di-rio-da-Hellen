import { Home, Sprout, BookHeart, Pill, Stethoscope, FlaskConical, CalendarDays } from "lucide-react";

// Itens do menu principal — escopo da Etapa 1 (MVP) do escopo do projeto.
// Dúvidas, Evolução, Memórias, Conquistas, Mural, Rede de apoio e
// Documentos entram nas próximas etapas.
export const NAV_ITEMS = [
  { href: "/", label: "Início", emoji: "🏠", icon: Home },
  { href: "/jornada", label: "Minha Jornada", emoji: "🌱", icon: Sprout },
  { href: "/diario", label: "Diário", emoji: "📖", icon: BookHeart },
  { href: "/tratamento", label: "Tratamento", emoji: "💊", icon: Pill },
  { href: "/sintomas", label: "Sintomas", emoji: "🩺", icon: Stethoscope },
  { href: "/exames", label: "Exames", emoji: "🧪", icon: FlaskConical },
  { href: "/agenda", label: "Agenda", emoji: "📅", icon: CalendarDays },
];

// Barra inferior no mobile — só os principais atalhos, com o botão central
// de registro rápido.
export const MOBILE_NAV_ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/diario", label: "Diário", icon: BookHeart },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/jornada", label: "Jornada", icon: Sprout },
];
