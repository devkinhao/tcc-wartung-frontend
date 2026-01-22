import { useRef } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";

type Props = {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
};

export function CustomersRowMenu({ open, onToggle, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useClickOutside(menuRef, onClose, [buttonRef], open);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-offWhite transition"
      >
        ⋮
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-4 top-8 bg-principal-white border rounded shadow-md w-40 z-10"
        >
          <button className="block w-full text-left px-4 py-2 hover:bg-offWhite">
            Ver cliente
          </button>
          <button className="block w-full text-left px-4 py-2 hover:bg-offWhite">
            Editar
          </button>
          <button className="block w-full text-left px-4 py-2 hover:bg-offWhite">
            Inspeções
          </button>
        </div>
      )}
    </div>
  );
}