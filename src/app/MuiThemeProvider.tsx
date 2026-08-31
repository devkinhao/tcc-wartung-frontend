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
      warning: { main: t.semantic.warning },
      error: { main: t.semantic.danger },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: typography.fontFamily,
      // Base de 16px (o padrão do MUI é 14). O sistema é usado no dia a dia por
      // um público mais velho — todo o texto derivado desta base fica ~15% maior.
      fontSize: 16,
      // Pesos já usados de forma consistente pelo app para títulos de página
      // (h6, via Breadcrumb size="large") e cabeçalhos de seção/card
      // (subtitle1/subtitle2) — centralizados aqui em vez de repetidos
      // como fontWeight inline em cada Typography.
      h6: { fontWeight: typography.weight.semibold },
      subtitle1: { fontWeight: typography.weight.semibold },
      subtitle2: { fontWeight: typography.weight.bold },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // O recharts 3 torna a área do gráfico (e fatias/barras) focável; ao
          // clicar, o navegador desenha um retângulo preto. Nossos gráficos não
          // têm ação via SVG — as ações ficam nas legendas fora dele — então
          // suprimimos o contorno. (Também passamos accessibilityLayer={false}
          // em cada gráfico para tirar a navegação por teclado do SVG.)
          ".recharts-wrapper :focus, .recharts-wrapper :focus-visible, .recharts-surface": {
            outline: "none",
          },
        },
      },
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