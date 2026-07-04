import { api } from "@/api/client";

export type ConfigurationResponseDTO = {
  name: string;
  value: string;
};

export async function getConfigurations(): Promise<ConfigurationResponseDTO[]> {
  const { data } = await api.get<ConfigurationResponseDTO[]>("/configurations");
  return data;
}

export async function updateConfigurations(configurations: Record<string, string>): Promise<void> {
  await api.put("/configurations", { configurations });
}
