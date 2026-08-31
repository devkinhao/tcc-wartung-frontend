import { IconButton, InputAdornment, Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useTranslation } from "react-i18next";

type Props = {
  /** true = senha visível (mostra o ícone de "ocultar"). */
  visible: boolean;
  onToggle: () => void;
};

/**
 * Adorno de fim para campos de senha: alterna a visibilidade do texto.
 * Centraliza o botão + tooltip + aria-label, antes repetidos em cada tela
 * com campo de senha (login, redefinir senha, perfil, cadastro de usuário).
 */
export function PasswordVisibilityToggle({ visible, onToggle }: Props) {
  const { t } = useTranslation();
  const label = visible ? t("common.actions.hidePassword") : t("common.actions.showPassword");

  return (
    <InputAdornment position="end">
      <Tooltip title={label}>
        <IconButton onClick={onToggle} edge="end" aria-label={label}>
          {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
      </Tooltip>
    </InputAdornment>
  );
}
