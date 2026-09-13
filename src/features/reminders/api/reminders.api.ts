import { api } from "@/api/client";

// ---- Response ----

export type ReminderResponseDTO = {
  id: number;
  text: string;
  dueDate: string;
  dueTime: string | null;
  done: boolean;
  completedAt: string | null;
  customerId: number | null;
  customerName: string | null;
  inspectionId: number | null;
  inspectionServiceName: string | null;
  createdAt: string;
  createdByUsername: string | null;
  updatedAt: string | null;
  updatedByUsername: string | null;
};

// ---- Request ----

export type ReminderCreateRequestDTO = {
  text: string;
  dueDate: string;
  dueTime?: string | null;
  customerId?: number | null;
  inspectionId?: number | null;
};

export type ReminderUpdateRequestDTO = {
  text: string;
  dueDate: string;
  dueTime?: string | null;
};

// ---- API calls ----

export async function listRemindersByCustomer(customerId: number): Promise<ReminderResponseDTO[]> {
  const { data } = await api.get<ReminderResponseDTO[]>("/reminders", { params: { customerId } });
  return data;
}

export async function listRemindersByInspection(inspectionId: number): Promise<ReminderResponseDTO[]> {
  const { data } = await api.get<ReminderResponseDTO[]>("/reminders", { params: { inspectionId } });
  return data;
}

export async function listDueReminders(): Promise<ReminderResponseDTO[]> {
  const { data } = await api.get<ReminderResponseDTO[]>("/reminders", { params: { due: true } });
  return data;
}

export async function createReminder(dto: ReminderCreateRequestDTO): Promise<ReminderResponseDTO> {
  const { data } = await api.post<ReminderResponseDTO>("/reminders", dto);
  return data;
}

export async function updateReminder(id: number, dto: ReminderUpdateRequestDTO): Promise<ReminderResponseDTO> {
  const { data } = await api.patch<ReminderResponseDTO>(`/reminders/${id}`, dto);
  return data;
}

export async function completeReminder(id: number): Promise<ReminderResponseDTO> {
  const { data } = await api.post<ReminderResponseDTO>(`/reminders/${id}/complete`);
  return data;
}

export async function reopenReminder(id: number): Promise<ReminderResponseDTO> {
  const { data } = await api.post<ReminderResponseDTO>(`/reminders/${id}/reopen`);
  return data;
}

export async function deleteReminder(id: number): Promise<void> {
  await api.delete(`/reminders/${id}`);
}
