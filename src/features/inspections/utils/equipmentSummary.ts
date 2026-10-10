import type { TFunction } from "i18next";
import { capacityValueKey, type ServiceCategory } from "../serviceCategory";

type EquipmentSummaryItem = {
  manufacturer: string | null;
  model: string | null;
  capacity: string | null;
  cylinderCount: number | null;
  btu: number | null;
  notes: string | null;
};

/** Campos de equipamento + observações de uma inspeção, na ordem, separados por
 * um espaço. Ignora os que ainda não foram preenchidos. A capacidade sai com a
 * unidade da categoria do serviço ("200 L", "800 KG", "3 BOTIJÕES", "12000 BTUs").
 * Usado ao lado do nome do serviço na lista de inspeções, na aba de inspeções
 * da empresa e nos cards de atenção da home. */
export function equipmentSummary(
  t: TFunction,
  category: ServiceCategory | null,
  item: EquipmentSummaryItem,
): string {
  const capacityKey = capacityValueKey(category);
  // `count` escolhe singular/plural nas unidades que variam (botijão/botijões).
  const withUnit = (amount: string | number | null | undefined) =>
    amount != null && amount !== "" && capacityKey ? t(capacityKey, { value: amount, count: Number(amount) }) : amount;

  return [
    item.manufacturer,
    item.model,
    withUnit(item.capacity?.trim()),
    withUnit(item.cylinderCount),
    withUnit(item.btu),
    item.notes,
  ]
    .filter((v) => v != null && String(v).trim() !== "")
    .join(" ");
}
