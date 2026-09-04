// Classificação do tipo de serviço — determina quais campos de equipamento a
// inspeção exige. Espelha o enum ServiceCategory do backend. Um ServiceType
// sem categoria (serviço customizado criado pelo admin) é tratado como
// genérico: nenhum campo de equipamento aparece nem é exigido.
export type ServiceCategory =
  | "CALDEIRA"
  | "COMPRESSOR"
  | "GAS"
  | "ELEVADOR"
  | "MANGUEIRA_INCENDIO"
  | "PMOC"
  | "TROCA_OLEO"
  | "CESTO_SUSPENSO";

export type EquipmentFieldKey = "manufacturer" | "model" | "capacity" | "cylinderCount" | "btu";

/** Valores dos campos de equipamento, sempre string no formulário (numéricos incluídos). */
export type EquipmentFieldValues = Record<EquipmentFieldKey, string>;

export const EMPTY_EQUIPMENT_FIELDS: EquipmentFieldValues = {
  manufacturer: "",
  model: "",
  capacity: "",
  cylinderCount: "",
  btu: "",
};

type FieldsConfig = {
  /** Campos exibidos, na ordem em que devem aparecer. */
  fields: EquipmentFieldKey[];
  /** Subconjunto de `fields` que é obrigatório. */
  required: EquipmentFieldKey[];
};

const SERVICE_CATEGORY_FIELDS: Record<ServiceCategory, FieldsConfig> = {
  CALDEIRA: { fields: ["manufacturer", "model", "capacity"], required: ["manufacturer", "model", "capacity"] },
  COMPRESSOR: { fields: ["manufacturer", "model", "capacity"], required: ["manufacturer", "model", "capacity"] },
  GAS: { fields: ["cylinderCount"], required: ["cylinderCount"] },
  ELEVADOR: { fields: ["manufacturer", "capacity"], required: [] },
  MANGUEIRA_INCENDIO: { fields: [], required: [] },
  PMOC: { fields: ["manufacturer", "btu"], required: ["manufacturer", "btu"] },
  TROCA_OLEO: { fields: [], required: [] },
  CESTO_SUSPENSO: { fields: [], required: [] },
};

const NO_FIELDS: FieldsConfig = { fields: [], required: [] };

/** `null`/`undefined` (serviço sem categoria) = genérico, sem campos de equipamento. */
export function getServiceFields(category: ServiceCategory | null | undefined): FieldsConfig {
  return category ? SERVICE_CATEGORY_FIELDS[category] : NO_FIELDS;
}

const NUMERIC_FIELDS = new Set<EquipmentFieldKey>(["cylinderCount", "btu"]);

/**
 * Valida os campos de equipamento conforme a categoria do serviço. Não usa o
 * `inspectionFormSchema` (zod) porque a obrigatoriedade depende de um valor
 * externo (a categoria) resolvido em runtime — mais simples como função pura.
 *
 * Retorna um registro `campo → chave i18n do erro`, vazio quando tudo válido.
 */
export function equipmentFieldErrors(
  category: ServiceCategory | null | undefined,
  values: EquipmentFieldValues,
): Partial<Record<EquipmentFieldKey, string>> {
  const { fields, required } = getServiceFields(category);
  const errors: Partial<Record<EquipmentFieldKey, string>> = {};

  for (const field of fields) {
    const raw = values[field].trim();
    const isRequired = required.includes(field);

    if (raw === "") {
      if (isRequired) errors[field] = "validation.required";
      continue;
    }

    if (NUMERIC_FIELDS.has(field) && !/^[1-9]\d*$/.test(raw)) {
      errors[field] = "validation.positiveIntegerInvalid";
    }
  }

  return errors;
}

export function isEquipmentValid(
  category: ServiceCategory | null | undefined,
  values: EquipmentFieldValues,
): boolean {
  return Object.keys(equipmentFieldErrors(category, values)).length === 0;
}

type EquipmentSource = {
  manufacturer: string | null;
  model: string | null;
  capacity: string | null;
  cylinderCount: number | null;
  btu: number | null;
};

/** Converte os campos de equipamento de uma inspeção (tipados) para o formato
 * string usado pelo formulário — usado para pré-preencher edição/renovação. */
export function toEquipmentValues(source?: EquipmentSource | null): EquipmentFieldValues {
  if (!source) return EMPTY_EQUIPMENT_FIELDS;
  return {
    manufacturer: source.manufacturer ?? "",
    model: source.model ?? "",
    capacity: source.capacity ?? "",
    cylinderCount: source.cylinderCount != null ? String(source.cylinderCount) : "",
    btu: source.btu != null ? String(source.btu) : "",
  };
}
