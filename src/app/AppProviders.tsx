import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { PreferencesProvider } from "@/features/preferences/PreferencesProvider";
import { ThemeSync } from "@/app/ThemeSync";
import { MuiThemeProvider } from "@/app/MuiThemeProvider";

/**
 * Árvore única de providers globais, de fora para dentro:
 *
 *   QueryClientProvider   — cache de dados de servidor (React Query)
 *   └ AuthProvider        — sessão/token; usa useQueryClient
 *     └ PreferencesProvider — preferências do usuário; usa useAuth
 *       ├ ThemeSync          — aplica o tema no DOM; usa useAuth + usePreferences
 *       └ MuiThemeProvider   — tema do MUI; usa useAuth + usePreferences
 *         └ SnackbarProvider — notificações; precisa herdar o tema do MUI
 *           └ children (App)
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 60 * 24,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PreferencesProvider>
          <ThemeSync />
          <MuiThemeProvider>
            <SnackbarProvider maxSnack={4} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
              {children}
            </SnackbarProvider>
          </MuiThemeProvider>
        </PreferencesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
