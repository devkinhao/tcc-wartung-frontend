import { Chip } from "@mui/material";
import type { AbvtexSealType } from "../types/abvtexSeal";
import { useTranslation } from "react-i18next";

type Props = {
  seal: AbvtexSealType;
  size?: "small" | "medium";
};

export function AbvtexChip({ seal, size = "small" }: Props) {
  const { t } = useTranslation();

  const getProps = () => {
    switch (seal) {
      case "NAO_POSSUI":
        return {
          label: t("abvtex.none"),
          sx: {
            bgcolor: "grey.200",
            color: "grey.800",
            fontWeight: 600,
          },
        };

      case "COBRE":
        return {
          label: t("abvtex.copper"),
          sx: {
            bgcolor: "#B87333",
            color: "#fff",
            fontWeight: 600,
          },
        };

      case "BRONZE":
        return {
          label: t("abvtex.bronze"),
          sx: {
            bgcolor: "#CD7F32",
            color: "#fff",
            fontWeight: 600,
          },
        };

      case "PRATA":
        return {
          label: t("abvtex.silver"),
          sx: {
            bgcolor: "#C0C0C0",
            color: "#000",
            fontWeight: 600,
          },
        };

      case "OURO":
        return {
          label: t("abvtex.gold"),
          sx: {
            bgcolor: "#D4AF37",
            color: "#000",
            fontWeight: 600,
          },
        };

      default:
        return {
          label: String(seal),
          sx: {},
        };
    }
  };

  const { label, sx } = getProps();
  return <Chip size={size} label={label} sx={sx} />;
}