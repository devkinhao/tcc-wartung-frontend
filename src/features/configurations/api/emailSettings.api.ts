import { api } from "@/api/client";

// ---- Response ----

export type EmailSettingsResponseDTO = {
  host: string | null;
  port: number | null;
  username: string | null;
  fromAddress: string | null;
  hasPassword: boolean;
  sendCopyToSender: boolean;
};

// ---- Request ----

export type EmailSettingsUpdateRequestDTO = {
  host: string;
  port: number;
  username: string;
  // Vazio/omitido mantém a senha atual — o GET nunca retorna a senha em si.
  password?: string;
  fromAddress: string;
  sendCopyToSender: boolean;
};

// ---- API calls ----

export async function getEmailSettings(): Promise<EmailSettingsResponseDTO> {
  const { data } = await api.get<EmailSettingsResponseDTO>("/configurations/email");
  return data;
}

export async function updateEmailSettings(dto: EmailSettingsUpdateRequestDTO): Promise<void> {
  await api.put("/configurations/email", dto);
}
