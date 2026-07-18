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
    chartLabel: 11,
    chartTick: 12,
    chartTooltip: 13,
    flagIcon: 16,
    avatarInitials: 32,
  },
} as const;
