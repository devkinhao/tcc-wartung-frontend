import { useEffect } from "react";
import { useAuth } from "@/features/auth/useAuth";
import { usePreferences } from "@/features/preferences/usePreferences";

/**
 * Single place that applies theme to the DOM.
 * Rule:
 *  - Logged out => always LIGHT (Nielsen: predictable / consistent)
 *  - Logged in  => uses user preference (preferences.THEME), fallback to localStorage
 */
export function ThemeSync() {
  const { isAuthenticated } = useAuth();
  const { preferences } = usePreferences();

  useEffect(() => {
    const root = document.documentElement;

    if (!isAuthenticated) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      return;
    }

    const theme = String(
      preferences.THEME ?? localStorage.getItem("theme") ?? "light"
    ).toLowerCase();

    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    localStorage.setItem("theme", theme);
  }, [isAuthenticated, preferences.THEME]);

  return null;
}
