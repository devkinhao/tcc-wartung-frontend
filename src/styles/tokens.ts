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
    text: { primary: "#303030", secondary: "#959595" },
    brand: { blue: "#2A4C61", green: "#78744C" },
    button: { gray: "#9E9D99", hover: "#BDBCB7" },
    semantic: { success: "#16a34a", danger: "#dc2626" },
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
    semantic: { success: "#4ade80", danger: "#f87171" },
  },
} as const;