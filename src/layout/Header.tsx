// ================================
// src/layout/Header.tsx
// ================================
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  User,
  Sliders,
  Bell,
} from "lucide-react";

type BreadcrumbItem = {
  label: string;
  path?: string;
};

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  "/dashboard": [
    { label: "Início", path: "/dashboard" },
  ],

  "/customers": [
    { label: "Início", path: "/dashboard" },
    { label: "Clientes" },
  ],

  "/users/me": [
    { label: "Início", path: "/dashboard" },
    { label: "Meu Perfil" },
  ],

  "/users/me/preferences": [
    { label: "Início", path: "/dashboard" },
    { label: "Meu Perfil", path: "/users/me" },
    { label: "Preferências" },
  ],
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const crumbs =
    breadcrumbMap[location.pathname] ??
    [{ label: "Início", path: "/dashboard" }];

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }

      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      {/* BREADCRUMB */}
      <nav className="text-sm text-gray-600 flex items-center gap-1">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <span key={crumb.label} className="flex items-center gap-1">
              {index > 0 && <span className="mx-1">|</span>}

              {crumb.path && !isLast ? (
                <button
                  onClick={() => navigate(crumb.path!)}
                  className="hover:text-gray-900 hover:underline"
                >
                  {crumb.label}
                </button>
              ) : (
                <span
                  className={
                    isLast
                      ? "font-medium text-gray-900"
                      : ""
                  }
                >
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      {/* AÇÕES DO HEADER */}
      <div className="flex items-center gap-2">
        {/* NOTIFICAÇÕES */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border rounded-md shadow-lg z-50">
              <div className="px-4 py-2 text-sm font-medium border-b">
                Notificações
              </div>
              <div className="px-4 py-3 text-sm text-gray-500">
                Nenhuma notificação no momento
              </div>
            </div>
          )}
        </div>

        {/* MENU DO USUÁRIO */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-md"
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-700">
              UL
            </div>

            <span className="text-sm text-gray-700">Usuário Logado</span>
            <ChevronDown size={16} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/users/me");
                }}
              >
                <User size={16} />
                Meu perfil
              </button>

              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/users/me/preferences");
                }}
              >
                <Sliders size={16} />
                Preferências
              </button>

              <div className="my-1 border-t" />

              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}