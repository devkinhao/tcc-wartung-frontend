/** Domínio. */
import { useAuth } from "@/features/auth/useAuth";
import { usePreferences } from "@/features/preferences/usePreferences";
/** Estilização. */
import { tokens } from "@/styles/tokens";
import { typography } from "@/styles/typography";
/** MUI Material. */
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
/** React. */
import { useEffect, useMemo } from "react";

/** Tipos personalizados para o tema do MUI. */
declare module "@mui/material/styles" {
  interface TypeText {
    contrast: string;
  }

  interface Palette {
    autofill: string;
  }

  interface PaletteOptions {
    autofill?: string;
  }
}

function buildTheme(mode: "light" | "dark") {
  const t = tokens[mode];

  return createTheme({
    palette: {
      mode,
      primary: { main: t.brand.blue },
      secondary: { main: t.brand.green },
      background: { default: t.bg.screen, paper: t.bg.card },
      text: {
        primary: t.text.primary,
        secondary: t.text.secondary,
        contrast: t.text.contrast,
      },
      autofill: t.bg.autofill,
      success: { main: t.semantic.success },
      warning: { main: t.semantic.warning },
      error: { main: t.semantic.danger },
    },
    /** Forma dos componentes do sistema. */
    shape: { borderRadius: 15 },
    typography: {
      fontFamily: typography.fontFamily,
      fontSize: 16,
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
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none" },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: { textTransform: "none" },
        },
      },
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
  /** Hooks */
  const { isAuthenticated } = useAuth();
  const { preferences } = usePreferences();

  const mode: "light" | "dark" = !isAuthenticated
    ? "light"
    : (String(preferences.THEME || localStorage.getItem("theme") || "light").toLowerCase() as "light" | "dark");

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
