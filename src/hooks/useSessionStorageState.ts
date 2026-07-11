import { useEffect, useState } from "react";

// Mantém o estado (filtros, paginação, ordenação) vivo no sessionStorage para que
// tabelas voltem ao mesmo ponto ao navegar para um registro (ou outra aba) e retornar.
export function useSessionStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // sessionStorage indisponível (modo privado, quota excedida) — ignora
    }
  }, [key, state]);

  return [state, setState] as const;
}
