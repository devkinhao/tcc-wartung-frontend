import { useMemo, useCallback, ReactNode, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import i18n from "@/app/i18n";
import { qk } from "@/api/keys";

import { getMyPreferences, updatePreference } from "./api/preferences.api";
import { PreferencesContext } from "./PreferencesContext";

type Preference = { name: string; value: string };

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: qk.preferences(),
    queryFn: getMyPreferences,
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const { mutate } = useMutation({
    mutationFn: ({ name, value }: Preference) => updatePreference(name, value),

    onMutate: async ({ name, value }: Preference) => {
      await queryClient.cancelQueries({ queryKey: qk.preferences() });

      const previous = queryClient.getQueryData(qk.preferences());

      queryClient.setQueryData<Preference[]>(qk.preferences(), (old = []) =>
        old.map((p) => (p.name === name ? { ...p, value } : p))
      );

      return { previous };
    },

    onError: (_, __, context) => {
      queryClient.setQueryData(qk.preferences(), context?.previous);
    },
  });

  const preferences = useMemo(() => {
    const map: Record<string, string> = {};
    data?.forEach((p) => {
      map[p.name] = p.value;
    });
    return map;
  }, [data]);

  // mutate é estável entre renders — useCallback correto
  const setPreference = useCallback(
    (name: string, value: string) => mutate({ name, value }),
    [mutate]
  );

  useEffect(() => {
    if (preferences.LANGUAGE) {
      i18n.changeLanguage(preferences.LANGUAGE);
    }
  }, [preferences.LANGUAGE]);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreference, isLoading }}>
      {children}
    </PreferencesContext.Provider>
  );
}
