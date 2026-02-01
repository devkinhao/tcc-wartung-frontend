import {
  MdArrowDropDown,
  MdLogout,
  MdPerson,
  MdTune,
} from "react-icons/md";

import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

import { useClickOutside } from "@/hooks/useClickOutside";
import { useAuth } from "@/auth/useAuth";
import { useMe } from "@/hooks/useMe";

import { getFirstName } from "@/utils/getFirstName";

export function UserMenu() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: user } = useMe();

  const [open, setOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const firstName = user ? getFirstName(user.fullName) : "";
  const avatarSrc = user?.avatarUrl
    ? `${import.meta.env.VITE_API_URL}${user.avatarUrl}`
    : null;

  useEffect(() => {
    setAvatarError(false);
  }, [avatarSrc]);

  if (!user) return null;

  function handleNavigate(path: string) {
    setOpen(false);
    navigate(path);
  }

  function handleLogout() {
    setOpen(false);
    logout();
    navigate("/login");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="
          flex items-center gap-2
          hover:bg-offWhite
          px-2 py-1 rounded-md transition
          text-text
        "
      >
        {/* Avatar */}
        {avatarSrc && !avatarError ? (
          <img
            key={avatarSrc}
            src={avatarSrc}
            alt={firstName}
            className="w-8 h-8 rounded-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="
            w-8 h-8 rounded-full
            bg-offWhite
            flex items-center justify-center
            text-xs font-bold
            text-text-secondary
          ">
            {firstName[0]}
          </div>
        )}

        <span className="text-sm text-text">
          {firstName}
        </span>

        <MdArrowDropDown className="text-text-secondary" />
      </button>

      {open && (
        <div
          className="
            absolute right-0 mt-2 w-48
            bg-principal-white
            border border-offWhite
            rounded-md shadow-lg z-50
          "
        >
          <button
            onClick={() => handleNavigate("/users/me")}
            className="
              w-full flex items-center gap-2
              px-4 py-2 text-sm
              text-text
              hover:bg-offWhite
              transition
            "
          >
            <MdPerson size={18} className="text-text-secondary" />
            Meu perfil
          </button>

          <button
            onClick={() => handleNavigate("/users/me/preferences")}
            className="
              w-full flex items-center gap-2
              px-4 py-2 text-sm
              text-text
              hover:bg-offWhite
              transition
            "
          >
            <MdTune size={18} className="text-text-secondary" />
            Preferências
          </button>

          <div className="my-1 border-t border-offWhite" />

          <button
            onClick={handleLogout}
            className="
              w-full flex items-center gap-2
              px-4 py-2 text-sm
              text-danger
              hover:bg-offWhite
              transition
            "
          >
            <MdLogout size={18} className="text-danger" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}