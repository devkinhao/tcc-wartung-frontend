import { useEffect, useState } from "react";

/**
 * Força uma única remontagem depois que o layout estabiliza. O ResponsiveContainer
 * do recharts às vezes mede o container antes do reflow final (fontes/grid ainda
 * ajustando) e o gráfico não recalcula a geometria sozinho depois. Use o valor
 * retornado como `key` no ResponsiveContainer.
 */
export function useChartRemountKey(): number {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setKey((k) => k + 1), 150);
    return () => clearTimeout(id);
  }, []);

  return key;
}
