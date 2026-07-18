import { useEffect, useMemo } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useAuth } from "@/features/auth/useAuth";
import { usePreferences } from "@/features/preferences/usePreferences";
import { tokens } from "@/styles/tokens";
import { typography } from "@/styles/typography";

function buildTheme(mode: "light" | "dark") {
  const t = tokens[mode];

  return createTheme({
    palette: {
      mode,
      primary: { main: t.brand.blue },
      secondary: { main: t.brand.green },
      background: { default: t.bg.screen, paper: t.bg.card },
      text: { primary: t.text.primary, secondary: t.text.secondary },
      success: { main: t.semantic.success },
      error: { main: t.semantic.danger },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: typography.fontFamily,
      // Pesos já usados de forma consistente pelo app para títulos de página
      // (h6, via Breadcrumb size="large") e cabeçalhos de seção/card
      // (subtitle1/subtitle2) — centralizados aqui em vez de repetidos
      // como fontWeight inline em cada Typography.
      h6: { fontWeight: typography.weight.semibold },
      subtitle1: { fontWeight: typography.weight.semibold },
      subtitle2: { fontWeight: typography.weight.bold },
    },
    components: {
      MuiAppBar: { styleOverrides: { root: { backgroundColor: t.bg.header } } },
      MuiDrawer: { styleOverrides: { paper: { backgroundColor: t.bg.sidebar } } },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            "&.active": { backgroundColor: t.bg.sidebarSelected },
          },
        },
      },
    },
  });
}

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { preferences } = usePreferences();

  const mode: "light" | "dark" = !isAuthenticated
    ? "light"
    : (String(preferences.THEME || localStorage.getItem("theme") || "light").toLowerCase() as "light" | "dark");

  // Persist choice (optional)
  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}