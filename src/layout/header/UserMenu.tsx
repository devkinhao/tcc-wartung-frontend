import { MdArrowDropDown, MdLogout, MdPerson, MdTune } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { clearToken } from "../../auth/authStorage"

export function UserMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));

  const logout = () => {
    setOpen(false);
    clearToken();
    navigate("/login");
  };

  const goTo = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // 🔥 ESSENCIAL
          setOpen((v) => !v);
        }}
        className="flex items-center gap-2 hover:bg-offWhite px-2 py-1 rounded-md transition"
      >
        <div className="w-8 h-8 rounded-full bg-offWhite flex items-center justify-center text-xs font-bold text-text-secondary">
          UL
        </div>
        <span className="text-sm text-text-default">Usuário Logado</span>
        <MdArrowDropDown className="text-text-secondary" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
          <button
            onClick={() => goTo("/users/me")}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-offWhite transition"
          >
            <MdPerson size={18} />
            Meu perfil
          </button>

          <button
            onClick={() => goTo("/users/me/preferences")}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-offWhite transition"
          >
            <MdTune size={18} />
            Preferências
          </button>

          <div className="my-1 border-t border-offWhite" />

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <MdLogout size={18} />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}