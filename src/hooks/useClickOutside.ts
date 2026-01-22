import { useEffect } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onOutside: () => void,
  ignoreRefs: React.RefObject<HTMLElement | null>[] = [],
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    function handleMouseDown(event: MouseEvent) {
      const target = event.target as Node;

      if (!ref.current) return;

      // click inside main element
      if (ref.current.contains(target)) return;

      // click inside ignored elements (ex: toggle button)
      for (const ignoreRef of ignoreRefs) {
        if (ignoreRef.current?.contains(target)) return;
      }

      onOutside();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOutside();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, onOutside, ignoreRefs, enabled]);
}