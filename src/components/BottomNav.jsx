"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { MOBILE_NAV_ITEMS } from "@/lib/nav";
import RegistrarMenu from "./RegistrarMenu";
import { useStore } from "@/lib/store";

export default function BottomNav() {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const { souAdmin } = useStore();

  const [antes, depois] = [
    MOBILE_NAV_ITEMS.slice(0, 2),
    MOBILE_NAV_ITEMS.slice(2),
  ];

  return (
    <>
      <RegistrarMenu aberto={menuAberto} onFechar={() => setMenuAberto(false)} />
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-line px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 items-center h-16">
          {antes.map((item) => (
            <ItemNav key={item.href} item={item} ativo={pathname === item.href} />
          ))}

          <div className="flex justify-center">
            {souAdmin && (
              <button
                type="button"
                onClick={() => setMenuAberto(true)}
                aria-label="Registrar"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-burnt text-white shadow-md -translate-y-3"
              >
                <Plus size={22} />
              </button>
            )}
          </div>

          {depois.map((item) => (
            <ItemNav key={item.href} item={item} ativo={pathname === item.href} />
          ))}
        </div>
      </nav>
    </>
  );
}

function ItemNav({ item, ativo }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex flex-col items-center justify-center gap-0.5 text-[11px] ${
        ativo ? "text-burnt" : "text-muted"
      }`}
    >
      <Icon size={20} />
      {item.label}
    </Link>
  );
}
