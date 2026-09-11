import { useEffect } from "react";
import { useThemeMode } from "./useThemeMode";

/**
 * Único lugar que aplica o tema no DOM: alterna a classe `.dark` no <html> e
 * persiste o modo no localStorage (para o próximo carregamento já abrir certo).
 * A regra de qual é o modo fica em `useThemeMode`.
 */
export function ThemeSync() {
  const mode = useThemeMode();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem("theme", mode);
  }, [mode]);

  return null;
}
