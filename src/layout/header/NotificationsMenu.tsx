import { useRef, useState } from "react";
import { MdNotifications } from "react-icons/md";
import { useClickOutside } from "@/hooks/useClickOutside";

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-offWhite transition"
      >
        <MdNotifications size={20} className="text-principal-blue" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-principal-white border rounded-md shadow-lg z-50">
          <div className="px-4 py-2 text-sm font-medium border-b border-offWhite">
            Notificações
          </div>
          <div className="px-4 py-3 text-sm text-text-secondary">
            Nenhuma notificação no momento
          </div>
        </div>
      )}
    </div>
  );
}