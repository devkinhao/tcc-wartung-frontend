export const typography = {
  fontFamily: ["Inter", "system-ui", "sans-serif"].join(","),
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  size: {
    chartLabel: 14,
    chartTick: 14,
    chartTooltip: 14,
    flagIcon: 16,
    avatarInitials: 32,
  },
  /**
   * Únicos tamanhos de texto permitidos na interface (14/16/18px), usados para
   * fixar cada variante do MUI a um valor exato — sem isso, o coeficiente de
   * escala do tema (fontSize/14) gera tamanhos quebrados (ex: h6 virando ~23px).
   */
  textScale: {
    sm: "0.875rem", // 14px
    md: "1rem", // 16px
    lg: "1.125rem", // 18px
  },
} as const;
