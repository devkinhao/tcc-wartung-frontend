import { useEffect, useState } from "react";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { todayISODate } from "@/utils/date";
import type { ReminderResponseDTO } from "../api/reminders.api";

const TEXT_MAX_LENGTH = 500;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string, dueDate: string, dueTime: string | null) => void;
  submitting: boolean;
  /** Presente = editando um lembrete existente; ausente = criando um novo. */
  initial?: ReminderResponseDTO | null;
};

export function ReminderFormDialog({ open, onClose, onSubmit, submitting, initial }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  const isEditing = initial != null;

  // Reseta o formulário sempre que o diálogo abre (criação ou edição de outro lembrete).
  useEffect(() => {
    if (open) {
      setText(initial?.text ?? "");
      setDueDate(initial?.dueDate ?? "");
      setDueTime(initial?.dueTime?.slice(0, 5) ?? "");
    }
  }, [open, initial]);

  const trimmed = text.trim();
  // Data retroativa só é bloqueada na criação — editar o texto de um lembrete que já
  // venceu (e continua pendente) não pode travar por causa da data antiga dele.
  const isPastDate = !isEditing && dueDate !== "" && dueDate < todayISODate();
  const isValid = trimmed.length > 0 && trimmed.length <= TEXT_MAX_LENGTH && dueDate !== "" && !isPastDate;

  function handleSubmit() {
    if (!isValid) return;
    onSubmit(trimmed, dueDate, dueTime || null);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {initial ? t("reminders.form.editTitle") : t("reminders.form.createTitle")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={t("reminders.form.fields.text")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            multiline
            minRows={2}
            fullWidth
            required
            autoFocus
            slotProps={{ htmlInput: { maxLength: TEXT_MAX_LENGTH } }}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label={t("reminders.form.fields.dueDate")}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              fullWidth
              required
              error={isPastDate}
              helperText={isPastDate ? t("reminders.form.errors.pastDate") : undefined}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: isEditing ? {} : { min: todayISODate() },
              }}
            />
            <TextField
              label={t("reminders.form.fields.dueTime")}
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t("common.actions.cancel")}
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid || submitting}>
          {submitting ? <CircularProgress size={20} color="inherit" /> : t("common.actions.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
