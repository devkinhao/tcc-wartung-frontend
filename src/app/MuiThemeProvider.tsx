import { tokens } from "@/styles/tokens";
import { typography } from "@/styles/typography";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useMemo } from "react";
import { useThemeMode } from "./useThemeMode";

/** Estende a tipagem do tema do MUI com tokens específicos da aplicação. */
declare module "@mui/material/styles" {
  interface TypeText {
    contrast: string;
  }

  interface Palette {
    autofill: string;
    selected: string;
  }

  interface PaletteOptions {
    autofill?: string;
  }
}

/** Cria o tema global da aplicação com suporte a modo claro e escuro. */
function buildTheme(mode: "light" | "dark") {
  const t = tokens[mode];

  return createTheme({
    palette: {
      mode,
      /** Cores principais do Wartung, usadas como destaque. */
      primary: { main: t.brand.blue },
      secondary: { main: t.brand.green },
      /** Fundo base da aplicação e superfícies elevadas. */
      background: { default: t.bg.screen, paper: t.bg.card },
      text: {
        primary: t.text.primary,
        secondary: t.text.secondary,
        contrast: t.text.contrast,
      },
      action: {
        /** Fundo para itens de menu quando selecionados. */
        selected: t.bg.selected,
      },
      /** Cor específica para campos de preenchimento automático. */
      autofill: t.bg.autofill,
      /** Cores para tratamento de erros do sistema. */
      success: { main: t.semantic.success },
      warning: { main: t.semantic.warning },
      error: { main: t.semantic.danger },
    },
    /** Mantém a aparência arredondada e consistente com o design system. */
    shape: { borderRadius: 15 },
    typography: {
      fontFamily: typography.fontFamily,
      /**
       * Cada variante é fixada em um dos 3 tamanhos permitidos (14/16/18px,
       * ver typography.textScale) — a hierarquia entre títulos/textos vem do
       * peso da fonte, não do tamanho, já que o padrão do sistema restringe
       * a escala a esses três valores.
       */
      h1: { fontSize: typography.textScale.lg, fontWeight: typography.weight.extrabold },
      h2: { fontSize: typography.textScale.lg, fontWeight: typography.weight.bold },
      h3: { fontSize: typography.textScale.lg, fontWeight: typography.weight.bold },
      h4: { fontSize: typography.textScale.lg, fontWeight: typography.weight.semibold },
      h5: { fontSize: typography.textScale.lg, fontWeight: typography.weight.semibold },
      h6: { fontSize: typography.textScale.md, fontWeight: typography.weight.semibold },
      subtitle1: { fontSize: typography.textScale.md, fontWeight: typography.weight.medium },
      subtitle2: { fontSize: typography.textScale.sm, fontWeight: typography.weight.medium },
      body1: { fontSize: typography.textScale.md },
      body2: { fontSize: typography.textScale.sm },
      button: { fontSize: typography.textScale.sm, fontWeight: typography.weight.medium },
      caption: { fontSize: typography.textScale.sm },
      overline: { fontSize: typography.textScale.sm, fontWeight: typography.weight.semibold },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          /**
           * O Recharts 3 torna a área do gráfico focável.
           * Ao clicar, o navegador pode desenhar um retângulo preto ao redor do SVG.
           * Como os gráficos não têm interações diretas no elemento, o contorno é removido para manter a UI limpa.
           */
          ".recharts-wrapper :focus, .recharts-wrapper :focus-visible, .recharts-surface":
            {
              outline: "none",
            },
        },
      },
      /** Cabeçalho principal da aplicação usando o token de fundo do header. */
      MuiAppBar: { styleOverrides: { root: { backgroundColor: t.bg.header } } },
      /** Sidebar do sistema com fundo específico para reforçar a separação visual do conteúdo principal. */
      MuiDrawer: {
        styleOverrides: { paper: { backgroundColor: t.bg.sidebar } },
      },
      MuiButton: {
        styleOverrides: {
          /** Evita que ações do MUI usem caixa alta por padrão, alinhando ao visual da interface e textos. */
          root: { textTransform: "none" },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: { textTransform: "none" },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            /** Cor de fundo padrão para os campos de texto. */
            backgroundColor: t.bg.card,
          },
        },
      },
    },
  });
}

/**
 * Provider global do tema da aplicação.
 * Resolve o tema atual (claro/escuro) via hook personalizado, evitando repetição em cada tela.
 */
export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeMode();
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
