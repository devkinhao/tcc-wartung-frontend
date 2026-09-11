import { useAuth } from "@/features/auth/useAuth";
import { usePreferences } from "@/features/preferences/usePreferences";

/**
 * Modo de tema efetivo — regra única usada tanto pelo DOM (ThemeSync) quanto
 * pelo tema do MUI (MuiThemeProvider):
 *
 *  - deslogado → sempre "light" (previsível/consistente)
 *  - logado    → preferência do usuário (`preferences.THEME`), com fallback no
 *                último tema salvo no localStorage (evita "flash" ao recarregar,
 *                antes de a preferência chegar do backend)
 */
export function useThemeMode(): "light" | "dark" {
  const { isAuthenticated } = useAuth();
  const { preferences } = usePreferences();

  if (!isAuthenticated) return "light";

  const raw = String(preferences.THEME ?? localStorage.getItem("theme") ?? "light").toLowerCase();
  return raw === "dark" ? "dark" : "light";
}
