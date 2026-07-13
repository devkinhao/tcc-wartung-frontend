import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/features/auth/AuthProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 60 * 24,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/*
          SnackbarProvider deve ficar dentro do MuiThemeProvider (em App.tsx)
          para herdar o tema. Mas como o AuthProvider precisa ser pai do App,
          e o MuiThemeProvider está dentro do App, o SnackbarProvider é
          renderizado dentro do MuiThemeProvider via App.tsx.
        */}
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
