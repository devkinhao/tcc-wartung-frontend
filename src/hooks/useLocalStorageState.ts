import { useEffect, useState } from "react";

// Mantém uma preferência puramente visual (ex: lista vs. grade) persistida no
// navegador entre sessões — ao contrário do useSessionStorageState, sobrevive
// ao fechar a aba. Não sincroniza entre dispositivos nem passa pelo backend:
// use para conveniências por-visualizador, não para estado que precisa ser
// compartilhado ou lido pelo servidor.
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // localStorage indisponível (modo privado, quota excedida) — ignora
    }
  }, [key, state]);

  return [state, setState] as const;
}
