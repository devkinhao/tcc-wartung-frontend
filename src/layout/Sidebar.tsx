import { NavLink } from "react-router-dom";
import {
  MdHome,
  MdPeople,
  MdChecklist,
  MdDescription,
  MdApartment,
  MdAdminPanelSettings,
  MdSettings,
  MdHelp,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

const menuPrincipal = [
  { label: "Início", to: "/dashboard", icon: MdHome },
  { label: "Lista de Empresas", to: "/customers", icon: MdPeople },
  { label: "Inspeções", to: "/inspections", icon: MdChecklist },
  { label: "Relatórios", to: "/reports", icon: MdDescription },
];

const menuOutros = [
  { label: "Minha Empresa", to: "/company", icon: MdApartment },
  { label: "Usuários", to: "/users", icon: MdAdminPanelSettings },
  { label: "Configurações", to: "/configurations", icon: MdSettings },
  { label: "Ajuda", to: "/help", icon: MdHelp },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const getNavLinkClasses = (isActive: boolean) =>
    `group relative flex items-center gap-3 px-4 py-3 text-sm rounded-md transition-colors ${
      isActive ? "bg-sidebar-selected font-medium" : "hover:bg-offWhite"
    }`;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-sidebar border-r transition-all duration-300 z-40 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* LOGO */}
      <NavLink
        to="/dashboard"
        className="h-14 flex items-center px-4 font-semibold text-principal-blue gap-2 overflow-hidden hover:opacity-80 transition"
      >
        <img
          src="/logo.png"
          alt="Logo"
          className="h-8 w-auto shrink-0"
        />

        <span
          className={`
            transition-all duration-300
            whitespace-nowrap overflow-hidden
            ${collapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"}
          `}
        >
          Engenharia Maas
        </span>
      </NavLink>

      {/* MENU */}
      <nav className="pt-6">
        {[...menuPrincipal, { divider: true }, ...menuOutros].map((item, idx) => {
          if ("divider" in item) {
            return <div key={idx} className="my-3 mx-4 border-t border-offWhite" />;
          }

          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => getNavLinkClasses(isActive)}
            >
              <Icon size={24} className="text-principal-blue shrink-0" />

              {!collapsed && (
                <span className="text-text-default whitespace-nowrap">
                  {item.label}
                </span>
              )}

              {collapsed && (
                <span className="absolute left-full ml-2 whitespace-nowrap rounded-md bg-principal-blue px-2 py-1 text-xs text-principal-white opacity-0 group-hover:opacity-100 transition shadow z-50">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* COLLAPSE */}
      <button
        onClick={onToggle}
        className="absolute bottom-4 right-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-offWhite transition"
      >
        {collapsed ? <MdChevronRight size={24} /> : <MdChevronLeft size={24} />}
      </button>
    </aside>
  );
}