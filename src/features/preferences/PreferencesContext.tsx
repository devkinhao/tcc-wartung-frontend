import { createContext } from "react";

export type PreferencesContextType = {
  preferences: Record<string, string>;
  setPreference: (name: string, value: string) => void;
  isLoading: boolean;
};

export const PreferencesContext = createContext<PreferencesContextType | null>(null);
