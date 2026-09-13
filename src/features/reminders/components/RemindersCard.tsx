import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DoneIcon from "@mui/icons-material/Done";
import { useTranslation } from "react-i18next";
import { daysFromToday } from "@/utils/date";
import { useReminders, type ReminderScope } from "../hooks/useReminders";
import { ReminderFormDialog } from "./ReminderFormDialog";
import type { ReminderResponseDTO } from "../api/reminders.api";

const cardSx = {
  borderRadius: 2,
  transition: (t: Theme) => t.transitions.create("box-shadow", { duration: t.transitions.duration.short }),
  "&:hover": { boxShadow: 4 },
} as const;

// Mesmo estilo textual usado na lista "Precisam de atenção" da home (venceu
// há/vence hoje/vence em X dias) — só fica destacado em vermelho/âmbar quando
// realmente urgente; datas futuras aparecem em texto neutro.
function dueUrgency(
  dueDate: string,
  done: boolean,
  t: (key: string, opts?: Record<string, unknown>) => string
): { text: string; color: "error.main" | "warning.main" | "text.secondary" } {
  const days = daysFromToday(dueDate);
  const dayUnit = t(Math.abs(days) === 1 ? "common.day" : "common.days");

  if (done) {
    const text =
      days < 0
        ? t("reminders.due.overdue", { count: Math.abs(days), unit: dayUnit })
        : days === 0
          ? t("reminders.due.today")
          : t("reminders.due.in", { count: days, unit: dayUnit });
    return { text, color: "text.secondary" };
  }

  if (days < 0) return { text: t("reminders.due.overdue", { count: Math.abs(days), unit: dayUnit }), color: "error.main" };
  if (days === 0) return { text: t("reminders.due.today"), color: "warning.main" };
  return { text: t("reminders.due.in", { count: days, unit: dayUnit }), color: "text.secondary" };
}

function context(reminder: ReminderResponseDTO, t: (key: string, opts?: Record<string, unknown>) => string) {
  if (reminder.inspectionServiceName) {
    return t("reminders.context.inspection", {
      service: reminder.inspectionServiceName,
      customer: reminder.customerName,
    });
  }
  if (reminder.customerName) {
    return t("reminders.context.customer", { customer: reminder.customerName });
  }
  return null;
}

type Props = { title?: string } & ReminderScope;

// Tempo mostrando a caixinha marcada antes de começar a sumir — dá tempo do
// usuário ver que a ação registrou, em vez do item só desaparecer na hora.
const CHECKED_PAUSE_MS = 500;

export function RemindersCard({ title, ...scope }: Props) {
  const { t } = useTranslation();
  const { reminders, loading, create, isCreating, update, isUpdating, complete, reopen, remove } = useReminders(scope);
  // Só nessa visão (home) concluir remove o item da lista — nos cards de
  // empresa/inspeção os concluídos continuam aparecendo (riscados, com "reabrir").
  const removesOnComplete = "due" in scope;
  const showContext = removesOnComplete;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ReminderResponseDTO | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [menuState, setMenuState] = useState<{ anchorEl: HTMLElement; reminder: ReminderResponseDTO } | null>(null);

  // Espelho local da lista do servidor — mantém um item já concluído (e
  // removido da resposta do servidor) montado até a animação de saída acabar,
  // em vez de sumir na hora que a mutation invalida a query.
  const [localReminders, setLocalReminders] = useState<ReminderResponseDTO[]>(reminders);
  const [exitingIds, setExitingIds] = useState<Set<number>>(new Set());
  const [optimisticDoneIds, setOptimisticDoneIds] = useState<Set<number>>(new Set());
  const pauseTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    setLocalReminders((prev) => {
      // Preserva um item que acabou de ser concluído (marcado otimisticamente no
      // clique, antes mesmo do servidor responder) mesmo que ele já tenha sumido
      // da resposta fresca — sem isso ele sumiria assim que a query revalidasse,
      // antes da pausa/animação de saída sequer começar.
      const stillCompleting = prev.filter(
        (r) => optimisticDoneIds.has(r.id) && !reminders.some((fresh) => fresh.id === r.id)
      );
      if (stillCompleting.length === 0) return reminders;

      // Reinsere cada um na posição original (em vez de só concatenar no fim) —
      // senão o item "pula" pro final da lista antes de sumir, em vez de sumir
      // do lugar onde já estava.
      const merged = [...reminders];
      for (const item of stillCompleting) {
        const originalIndex = prev.findIndex((r) => r.id === item.id);
        merged.splice(Math.min(originalIndex, merged.length), 0, item);
      }
      return merged;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders]);

  useEffect(() => {
    const timeouts = pauseTimeouts.current;
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  function handleToggle(reminder: ReminderResponseDTO) {
    if (reminder.done) {
      reopen(reminder.id);
      return;
    }

    setOptimisticDoneIds((prev) => new Set(prev).add(reminder.id));
    complete(reminder.id, {
      onError: () => {
        clearTimeout(pauseTimeouts.current.get(reminder.id));
        pauseTimeouts.current.delete(reminder.id);
        setOptimisticDoneIds((prev) => {
          const next = new Set(prev);
          next.delete(reminder.id);
          return next;
        });
      },
    });

    if (removesOnComplete) {
      const timeoutId = setTimeout(() => {
        setExitingIds((prev) => new Set(prev).add(reminder.id));
        pauseTimeouts.current.delete(reminder.id);
      }, CHECKED_PAUSE_MS);
      pauseTimeouts.current.set(reminder.id, timeoutId);
    }
  }

  function handleExited(id: number) {
    setExitingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setOptimisticDoneIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setLocalReminders((prev) => prev.filter((r) => r.id !== id));
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(reminder: ReminderResponseDTO) {
    setEditing(reminder);
    setFormOpen(true);
  }

  function handleSubmit(text: string, dueDate: string, dueTime: string | null) {
    if (editing) {
      update(editing.id, { text, dueDate, dueTime });
    } else {
      create(text, dueDate, dueTime);
    }
    setFormOpen(false);
  }

  return (
    <Card sx={cardSx}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle2">{title ?? t("reminders.title")}</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={openCreate} sx={{ textTransform: "none" }}>
            {t("reminders.actions.add")}
          </Button>
        </Stack>

        {loading ? (
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ py: 3 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">{t("common.loading")}</Typography>
          </Stack>
        ) : localReminders.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            {t("reminders.empty")}
          </Typography>
        ) : (
          <Stack divider={<Divider />}>
            {localReminders.map((reminder) => {
              const isDone = reminder.done || optimisticDoneIds.has(reminder.id);
              return (
              <Collapse key={reminder.id} in={!exitingIds.has(reminder.id)} onExited={() => handleExited(reminder.id)}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="flex-start"
                sx={{ py: 1 }}
              >
                <Tooltip title={isDone ? t("reminders.actions.reopen") : t("reminders.actions.complete")}>
                  <IconButton
                    onClick={() => handleToggle(reminder)}
                    size="small"
                    aria-label={isDone ? t("reminders.actions.reopen") : t("reminders.actions.complete")}
                    sx={{
                      mt: -0.5,
                      color: isDone ? "success.main" : "action.active",
                      transition: (t) => t.transitions.create("color"),
                      "&:hover": { color: "success.main" },
                    }}
                  >
                    <DoneIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: isDone ? "line-through" : "none",
                      color: isDone ? "text.secondary" : "text.primary",
                      wordBreak: "break-word",
                    }}
                  >
                    {reminder.text}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap" }}>
                    {(() => {
                      const urgency = dueUrgency(reminder.dueDate, isDone, t);
                      return (
                        <Typography
                          variant="caption"
                          fontWeight={urgency.color === "text.secondary" ? 400 : 700}
                          color={urgency.color}
                          sx={{ textDecoration: isDone ? "line-through" : "none" }}
                        >
                          {urgency.text}
                          {reminder.dueTime && ` · ${reminder.dueTime.slice(0, 5)}`}
                        </Typography>
                      );
                    })()}
                    {showContext && context(reminder, t) && (
                      <Typography variant="caption" color="text.secondary">
                        {context(reminder, t)}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Tooltip title={t("common.actions.more")}>
                  <IconButton
                    size="small"
                    onClick={(e) => setMenuState({ anchorEl: e.currentTarget, reminder })}
                    aria-label={t("common.actions.more")}
                    sx={{ flexShrink: 0 }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              </Collapse>
              );
            })}
          </Stack>
        )}
      </CardContent>

      <Menu anchorEl={menuState?.anchorEl} open={menuState !== null} onClose={() => setMenuState(null)}>
        <MenuItem
          onClick={() => {
            if (menuState) openEdit(menuState.reminder);
            setMenuState(null);
          }}
        >
          {t("common.actions.edit")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuState) setConfirmDeleteId(menuState.reminder.id);
            setMenuState(null);
          }}
        >
          {t("reminders.actions.delete")}
        </MenuItem>
      </Menu>

      <ReminderFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        submitting={isCreating || isUpdating}
        initial={editing}
      />

      <Dialog open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("reminders.confirmDelete.title")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{t("reminders.confirmDelete.message")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>{t("common.actions.cancel")}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (confirmDeleteId !== null) remove(confirmDeleteId);
              setConfirmDeleteId(null);
            }}
          >
            {t("common.actions.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
