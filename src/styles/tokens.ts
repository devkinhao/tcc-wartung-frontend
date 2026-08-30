export const tokens = {
  light: {
    bg: {
      sidebar: "#FAFAFA",
      sidebarSelected: "#EFEFEC",
      header: "#e6e3e3",
      screen: "#F5F5F5",
      card: "#FFFEFD",
      offWhite: "#E5E4DE",
      tableHeader: "#E8E8E8",
      tableBody: "#F2F2F2",
    },
    // secondary em #707070 — o valor original (#959595) ficava abaixo de 4.5:1
    // (WCAG AA) contra os fundos claros do app (screen/card); #707070 passa
    // em ambos (~4.5:1 e ~4.9:1) mantendo o mesmo tom de cinza.
    text: { primary: "#303030", secondary: "#707070" },
    brand: { blue: "#2A4C61", green: "#78744C" },
    button: { gray: "#9E9D99", hover: "#BDBCB7" },
    semantic: { success: "#16a34a", warning: "#d97706", danger: "#dc2626" },
  },
  dark: {
    bg: {
      sidebar: "#252527",
      sidebarSelected: "#27272A",
      header: "#09090B",
      screen: "#151516",
      card: "#111113",
      offWhite: "#1F1F23",
      tableHeader: "#18181B",
      tableBody: "#111113",
    },
    text: { primary: "#F4F4F5", secondary: "#A1A1AA" },
    brand: { blue: "#6FA3C8", green: "#A6A072" },
    button: { gray: "#3F3F46", hover: "#52525B" },
    semantic: { success: "#4ade80", warning: "#fbbf24", danger: "#f87171" },
  },
} as const;