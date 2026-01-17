// ================================
// src/layout/Sidebar.tsx
// ================================
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  ClipboardCheck,
  FileText,
  Building2,
  UserCog,
  Sliders,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";

const menuPrincipal = [
  { label: "Início", to: "/dashboard", icon: Home },
  { label: "Clientes", to: "/customers", icon: Users },
  { label: "Inspeções", to: "/inspections", icon: ClipboardCheck },
  { label: "Relatórios", to: "/reports", icon: FileText },
];

const menuOutros = [
  { label: "Minha Empresa", to: "/company", icon: Building2 },
  { label: "Usuários", to: "/users", icon: UserCog },
  { label: "Configurações", to: "/configurations", icon: Settings },
  { label: "Ajuda", to: "/help", icon: HelpCircle },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative h-screen bg-white border-r transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* LOGO / TÍTULO */}
      <div className="h-14 flex items-center px-4 border-b font-semibold whitespace-nowrap overflow-hidden">
        {!collapsed && "Engenharia Maas"}
      </div>

      {/* MENU */}
      <nav className="flex-1 py-2">
        {/* ===== GRUPO PRINCIPAL ===== */}
        {menuPrincipal.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors
              ${isActive ? "bg-gray-100 font-medium" : "hover:bg-gray-50"}`
            }
          >
            <Icon size={20} className="shrink-0" />

            {!collapsed && (
              <span className="whitespace-nowrap overflow-hidden">
                {label}
              </span>
            )}

            {collapsed && (
              <span
                className="
                  absolute left-full ml-2
                  whitespace-nowrap
                  shadow-md
                  rounded-md bg-gray-900 px-2 py-1
                  text-xs text-white
                  opacity-0 group-hover:opacity-100
                  pointer-events-none
                  transition
                  z-50
                "
              >
                {label}
              </span>
            )}
          </NavLink>
        ))}

        {/* ===== DIVISOR ===== */}
        <div className="my-3 mx-4 border-t border-gray-200" />

        {/* ===== GRUPO OUTROS ===== */}
        {menuOutros.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors
              ${isActive ? "bg-gray-100 font-medium" : "hover:bg-gray-50"}`
            }
          >
            <Icon size={20} className="shrink-0" />

            {!collapsed && (
              <span className="whitespace-nowrap overflow-hidden">
                {label}
              </span>
            )}

            {collapsed && (
              <span
                className="
                  absolute left-full ml-2
                  whitespace-nowrap
                  shadow-md
                  rounded-md bg-gray-900 px-2 py-1
                  text-xs text-white
                  opacity-0 group-hover:opacity-100
                  pointer-events-none
                  transition
                  z-50
                "
              >
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* BOTÃO COLLAPSE */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-4 right-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}