import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import {
  completeReminder,
  createReminder,
  deleteReminder,
  listDueReminders,
  listRemindersByCustomer,
  listRemindersByInspection,
  reopenReminder,
  updateReminder,
  type ReminderUpdateRequestDTO,
} from "../api/reminders.api";

export type ReminderScope = { customerId: number } | { inspectionId: number } | { due: true };

export function useReminders(scope: ReminderScope) {
  const qc = useQueryClient();
  const notify = useNotify();

  const queryKey =
    "customerId" in scope ? qk.remindersByCustomer(scope.customerId)
    : "inspectionId" in scope ? qk.remindersByInspection(scope.inspectionId)
    : qk.remindersDue();

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      "customerId" in scope ? listRemindersByCustomer(scope.customerId)
      : "inspectionId" in scope ? listRemindersByInspection(scope.inspectionId)
      : listDueReminders(),
  });

  // Poucas queries, pouco acessadas — invalidar tudo em vez de escolher a chave
  // certa evita esquecer de atualizar o widget da home ao mutar por um card
  // (empresa/inspeção), ou vice-versa.
  function invalidateAll() {
    qc.invalidateQueries({ queryKey: qk.remindersAll });
  }

  const createMutation = useMutation({
    mutationFn: (payload: { text: string; dueDate: string; dueTime: string | null }) =>
      createReminder({
        text: payload.text,
        dueDate: payload.dueDate,
        dueTime: payload.dueTime,
        customerId: "customerId" in scope ? scope.customerId : null,
        inspectionId: "inspectionId" in scope ? scope.inspectionId : null,
      }),
    onSuccess: () => {
      invalidateAll();
      notify.success("notify.success.saved");
    },
    onError: (err) => notify.fromError(err),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ReminderUpdateRequestDTO }) => updateReminder(id, dto),
    onSuccess: () => {
      invalidateAll();
      notify.success("notify.success.saved");
    },
    onError: (err) => notify.fromError(err),
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => completeReminder(id),
    onSuccess: invalidateAll,
    onError: (err) => notify.fromError(err),
  });

  const reopenMutation = useMutation({
    mutationFn: (id: number) => reopenReminder(id),
    onSuccess: invalidateAll,
    onError: (err) => notify.fromError(err),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteReminder(id),
    onSuccess: () => {
      invalidateAll();
      notify.success("notify.success.reminderDeleted");
    },
    onError: (err) => notify.fromError(err),
  });

  return {
    reminders: data ?? [],
    loading: isLoading,
    create: (text: string, dueDate: string, dueTime: string | null) =>
      createMutation.mutate({ text, dueDate, dueTime }),
    isCreating: createMutation.isPending,
    update: (id: number, dto: ReminderUpdateRequestDTO) => updateMutation.mutate({ id, dto }),
    isUpdating: updateMutation.isPending,
    complete: (id: number, options?: { onError?: () => void }) => completeMutation.mutate(id, options),
    reopen: (id: number) => reopenMutation.mutate(id),
    remove: (id: number) => deleteMutation.mutate(id),
  };
}
