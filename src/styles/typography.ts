/** Tokens tipográficos centrais da aplicação, com fonte, pesos e escala de tamanhos. */
export const typography = {
  fontFamily: ["Inter", "system-ui", "sans-serif"].join(","),
  /** Pesos de fonte permitidos, usados para compor a hierarquia visual dos textos. */
  weight: {
    regular: 400,
    semibold: 600,
    bold: 700,
  },
  /** Tamanhos pontuais para elementos específicos fora da escala tipográfica do MUI. */
  size: {
    chartLabel: 14,
    chartTick: 14,
    chartTooltip: 14,
    flagIcon: 16,
    avatarInitials: 32,
  },
  /**
   * Tamanhos de texto permitidos na interface.
   * São usados para fixar cada variante do MUI a um valor exato.
   */
  textScale: {
    /** 12px, para tooltips do sistema. */
    xs: "0.75rem",
    /** 14px, usado em textos auxiliares, legendas e rótulos. */
    sm: "0.875rem",
    /** 16px, tamanho base para corpo de texto e subtítulos. */
    md: "1.0rem",
    /** 18p, usado em títulos de menor destaque (h2-h5). */
    lg: "1.25rem",
    /** 24px, usado no título de maior destaque (h1). */
    xl: "1.5rem",
  },
} as const;
