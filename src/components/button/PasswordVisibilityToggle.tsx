import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { IconButton, InputAdornment } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../Tooltip";

type PasswordVisibilityToggleProps = {
  visible: boolean;
  onToggle: () => void;
};

/** Adorno de fim para campos de senha, alterna a visibilidade do texto. */
export function PasswordVisibilityToggle({
  visible,
  onToggle,
}: PasswordVisibilityToggleProps) {
  const { t } = useTranslation();
  const label = visible
    ? t("common.tooltip.hidePassword")
    : t("common.tooltip.showPassword");

  return (
    <InputAdornment position="end">
      <Tooltip title={label}>
        <IconButton
          size="small"
          edge="end"
          onClick={onToggle}
          aria-label={label}
        >
          {visible ? (
            <VisibilityOffIcon fontSize="small" />
          ) : (
            <VisibilityIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </InputAdornment>
  );
}
