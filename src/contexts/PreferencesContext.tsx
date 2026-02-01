import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getMyPreferences,
  updatePreference,
} from "@/services/userPreferenceService";

type PreferencesContextType = {
  preferences: Record<string, string>;
  setPreference: (name: string, value: string) => void;
  isLoading: boolean;
};

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["preferences"],
    queryFn: getMyPreferences,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: ({ name, value }: any) =>
      updatePreference(name, value),

    // ⭐ optimistic update (UX absurda de boa)
    onMutate: async ({ name, value }) => {
      await queryClient.cancelQueries({ queryKey: ["preferences"] });

      const previous = queryClient.getQueryData(["preferences"]);

      queryClient.setQueryData(["preferences"], (old: any) =>
        old.map((p: any) =>
          p.name === name ? { ...p, value } : p
        )
      );

      return { previous };
    },

    onError: (_, __, context) => {
      queryClient.setQueryData(["preferences"], context?.previous);
    },
  });

  const preferences = useMemo(() => {
    const map: Record<string, string> = {};

    data?.forEach((p) => {
      map[p.name] = p.value;
    });

    return map;
  }, [data]);

  // ⭐ aplica tema automaticamente
  useMemo(() => {
    const theme = preferences.THEME;

    if (!theme) return;

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [preferences.THEME]);

  const setPreference = (name: string, value: string) => {
    mutation.mutate({ name, value });
  };

  return (
    <PreferencesContext.Provider
      value={{ preferences, setPreference, isLoading }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);

  if (!ctx) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }

  return ctx;
}