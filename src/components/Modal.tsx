import { useEffect, useMemo, useRef } from "react";
import type React from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function Modal({ open, title, onClose, children, footer, className }: ModalProps) {
  // Evita re-montar o portal / perder foco quando o parent re-renderiza
  // (ex.: digitação em inputs). Mantemos a referência mais recente de onClose.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const portalEl = useMemo(() => {
    const el = document.createElement("div");
    el.setAttribute("data-modal-root", "true");
    return el;
  }, []);

  useEffect(() => {
    if (!open) return;

    // trava scroll do body enquanto o modal estiver aberto
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // renderiza em portal para evitar que o overlay fique preso em stacking contexts do layout
    document.body.appendChild(portalEl);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (portalEl.parentElement) portalEl.parentElement.removeChild(portalEl);
    };
  }, [open, portalEl]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed left-0 top-0 z-[9999] h-screen w-screen bg-black/50"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // fecha ao clicar fora do conteúdo
        if (e.target === e.currentTarget) onCloseRef.current();
      }}
    >
      <div className="flex h-full w-full items-center justify-center p-4">
        <div
          className={
            "w-full max-w-3xl rounded bg-principal-white shadow-lg " +
            "border border-black/5 " +
            (className ?? "")
          }
        >
          {(title ?? "") !== "" && (
            <div className="flex items-center justify-between px-6 pt-5">
              <h2 className="text-lg font-medium text-text">{title}</h2>
              <button
                type="button"
                onClick={() => onCloseRef.current()}
                className="rounded px-2 py-1 text-text-secondary hover:bg-offWhite"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
          )}

          <div className="px-6 pb-6 pt-4">{children}</div>

          {footer && (
            <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    portalEl
  );
}
