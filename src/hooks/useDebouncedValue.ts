import { useEffect, useState } from "react";

// Atrasa a propagação de um valor que muda muito rápido (ex: texto de busca
// digitado tecla a tecla) para evitar disparar uma requisição por caractere.
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
