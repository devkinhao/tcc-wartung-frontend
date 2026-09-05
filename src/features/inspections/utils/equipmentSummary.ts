/** Campos de equipamento + observações de uma inspeção, na ordem, separados por
 * um espaço. Ignora os que ainda não foram preenchidos. Usado na linha de baixo
 * da coluna "Serviço" (lista de inspeções) e nos cards de atenção da home. */
export function equipmentSummary(item: {
  manufacturer: string | null;
  model: string | null;
  capacity: string | null;
  cylinderCount: number | null;
  btu: number | null;
  notes: string | null;
}): string {
  return [item.manufacturer, item.model, item.capacity, item.cylinderCount, item.btu, item.notes]
    .filter((v) => v != null && String(v).trim() !== "")
    .join(" ");
}
