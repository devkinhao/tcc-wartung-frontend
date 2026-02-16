import { Chip } from "@mui/material";
import type { AbvtexSealType } from "../types";

type Props = {
  seal: AbvtexSealType;
  size?: "small" | "medium";
};

export function AbvtexChip({ seal, size = "small" }: Props) {
  const getProps = () => {
    switch (seal) {
      case "NAO_POSSUI":
        return {
          label: "Não possui",
          sx: {
            bgcolor: "grey.200",
            color: "grey.800",
            fontWeight: 600,
          },
        };

      case "COBRE":
        return {
          label: "Cobre",
          sx: {
            bgcolor: "#B87333",
            color: "#fff",
            fontWeight: 600,
          },
        };

      case "BRONZE":
        return {
          label: "Bronze",
          sx: {
            bgcolor: "#CD7F32",
            color: "#fff",
            fontWeight: 600,
          },
        };

      case "PRATA":
        return {
          label: "Prata",
          sx: {
            bgcolor: "#C0C0C0",
            color: "#000",
            fontWeight: 600,
          },
        };

      case "OURO":
        return {
          label: "Ouro",
          sx: {
            bgcolor: "#D4AF37",
            color: "#000",
            fontWeight: 600,
          },
        };

      default:
        return {
          label: seal,
          sx: {},
        };
    }
  };

  const { label, sx } = getProps();

  return <Chip size={size} label={label} sx={sx} />;
}