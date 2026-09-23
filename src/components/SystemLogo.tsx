import { paths } from "@/routes/paths";
import { Box, Typography, type SxProps, type Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Tooltip } from "./Tooltip";

type SystemLogoProps = {
  /** Permite reutilizar a logo em telas com e sem navegação. */
  navigable?: boolean;
  to?: string;
  showLabel?: boolean;
  sx?: SxProps<Theme>;
};

/** Logo do sistema, opcionalmente navegável e com nome do sistema ao lado. */
export function SystemLogo({
  navigable = false,
  to = paths.home,
  showLabel = true,
  sx,
}: SystemLogoProps) {
  const { t } = useTranslation();

  /** Conteúdo estático com logo e nome do sistema. */
  const content = (
    <>
      <Box
        component="img"
        src="/logo.png"
        alt={t("common.alt.logo")}
        sx={{ height: 45, borderRadius: 1 }}
      />
      {showLabel && (
        <Typography variant="h3" sx={{ color: "primary.main" }}>
          {t("app.brandName")}
        </Typography>
      )}
    </>
  );

  /** Estilos compartilhados do wrapper para manter a logo alinhada e consistente em todos as telas. */
  const wrapperSx = {
    display: "flex",
    alignItems: "center",
    mt: 2.5,
    mx: 2.5,
    mb: 0.7,
    gap: 1.5,
    ...sx,
  };

  /** Versão estática da logo para uso em telas sem navegação. */
  if (!navigable) {
    return <Box sx={wrapperSx}>{content}</Box>;
  }

  /** Logo navegável com link de retorno para a home. */
  return (
    <Tooltip title={t("common.tooltip.logo")} placement="right">
      <Box
        component={NavLink}
        to={to}
        sx={{ ...wrapperSx, textDecoration: "none" }}
      >
        {content}
      </Box>
    </Tooltip>
  );
}
