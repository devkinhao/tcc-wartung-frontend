import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Fade } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { PreferencesProvider } from "@/features/preferences/PreferencesProvider";
import { ThemeSync } from "@/app/ThemeSync";
import { MuiThemeProvider } from "@/app/MuiThemeProvider";
import { Toast } from "@/components/Toast";

const TOAST_VARIANTS = { success: Toast, error: Toast, warning: Toast, info: Toast, default: Toast };

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
            {/* Toasts no canto inferior direito, empilhados (até 5). O tempo de
                vida e a barra de progresso são controlados pelo componente
                `Toast` — por isso `autoHideDuration={null}` aqui. */}
            <SnackbarProvider
              maxSnack={5}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              autoHideDuration={null}
              TransitionComponent={Fade}
              transitionDuration={{ enter: 250, exit: 500 }}
              Components={TOAST_VARIANTS}
            >
              {children}
            </SnackbarProvider>
          </MuiThemeProvider>
        </PreferencesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
