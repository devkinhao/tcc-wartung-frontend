import { api } from "@/api/client";
import { PreferenceOptionMap, UserPreference } from "@/types/preferences";

export async function getMyPreferences(): Promise<UserPreference[]> {
  const { data } = await api.get("/users/me/preferences");
  return data;
}

export async function updatePreference(
  name: string,
  value: string
) {
  await api.put("/users/me/preferences", { name, value });
}

export async function getPreferenceOptions(): Promise<PreferenceOptionMap> {
  const { data } = await api.get("/users/preferences/options");
  return data.options;
}
