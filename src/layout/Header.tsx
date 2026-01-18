import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { MdArrowDropDown, MdLogout, MdPerson, MdTune, MdNotifications } from "react-icons/md";

type BreadcrumbItem = { label: string; path?: string };

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  "/dashboard": [{ label: "Início", path: "/dashboard" }],
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
  const crumbs = breadcrumbMap[location.pathname] ?? [{ label: "Início", path: "/dashboard" }];

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="h-14 bg-screen border-b flex items-center justify-between px-6">
      {/* BREADCRUMB */}
      <nav className="text-sm flex items-center gap-1 text-text-secondary">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <span key={crumb.label} className="flex items-center gap-1">
              {idx > 0 && <span className="mx-1 text-text-secondary">|</span>}

              {crumb.path && !isLast ? (
                <button
                  onClick={() => navigate(crumb.path!)}
                  className="hover:text-principal-blue hover:underline text-text-secondary"
                >
                  {crumb.label}
                </button>
              ) : (
                <span
                  className={`font-medium ${
                    isLast ? "text-principal-blue" : "text-text-secondary"
                  }`}
                >
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      {/* ACTIONS */}
      <div className="flex items-center gap-2">
        {/* NOTIFICATIONS */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-offWhite transition"
          >
            <MdNotifications size={20} className="text-principal-blue" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-principal-white border rounded-md shadow-lg z-50">
              <div className="px-4 py-2 text-sm font-medium border-b border-offWhite">Notificações</div>
              <div className="px-4 py-3 text-sm text-text-secondary">Nenhuma notificação no momento</div>
            </div>
          )}
        </div>

        {/* USER MENU */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 hover:bg-offWhite px-2 py-1 rounded-md transition"
          >
            <div className="w-8 h-8 rounded-full bg-offWhite flex items-center justify-center text-xs font-bold text-text-secondary">UL</div>
            <span className="text-sm text-text-default">Usuário Logado</span>
            <MdArrowDropDown size={20} className="text-text-secondary" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-principal-white border rounded-md shadow-lg z-50">
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-offWhite transition"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/users/me");
                }}
              >
                <MdPerson size={18} />
                Meu perfil
              </button>

              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-offWhite transition"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/users/me/preferences");
                }}
              >
                <MdTune size={18} />
                Preferências
              </button>

              <div className="my-1 border-t border-offWhite" />

              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                onClick={handleLogout}
              >
                <MdLogout size={18} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}