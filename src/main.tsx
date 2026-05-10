import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@/app/i18n";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider } from "notistack";

import { AuthProvider } from "./features/auth/AuthProvider";

function AppProviders({ children }: { children: React.ReactNode }) {
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

      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
