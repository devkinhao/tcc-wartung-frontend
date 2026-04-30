import { Button, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";

type Props = {
  title: string;
  editing: boolean;
  saving?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
};

/**
 * Cabeçalho reutilizável para cards editáveis.
 * Exibe o título e alterna entre botão "Editar" e botões "Cancelar / Salvar".
 */
export function EditableCardHeader({ title, editing, saving = false, onEdit, onCancel, onSave }: Props) {
  const { t } = useTranslation();

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Typography fontWeight={700} color="text.primary">
        {title}
      </Typography>

      {!editing ? (
        <Button startIcon={<EditIcon />} onClick={onEdit}>
          {t("common.actions.edit")}
        </Button>
      ) : (
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={onCancel} disabled={saving}>
            {t("common.actions.cancel")}
          </Button>
          <Button variant="contained" onClick={onSave} disabled={saving}>
            {t("common.actions.save")}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
