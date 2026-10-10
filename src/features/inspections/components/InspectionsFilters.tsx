import { qk } from "@/api/keys";
import { Button } from "@/components/button/Button";
import { FormField } from "@/components/form/FormField";
import { Add, FilterAltOff, SearchOutlined } from "@mui/icons-material";
import { MenuItem, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getServiceTypes } from "../api/inspections.create.api";
import type {
  InspectionListFilters,
  InspectionStatus,
} from "../api/inspections.list.api";

type InspectionsFiltersProps = {
  filters: InspectionListFilters;
  hasActiveFilters: boolean;
  onChange: <K extends keyof InspectionListFilters>(
    key: K,
    value: InspectionListFilters[K],
  ) => void;
  onClear: () => void;
  onAddInspection: () => void;
};

/** Barra de filtros da listagem de inspeções, com ações de limpar e adicionar. */
export function InspectionsFilters({
  filters,
  hasActiveFilters,
  onChange,
  onClear,
  onAddInspection,
}: InspectionsFiltersProps) {
  /** Hooks. */
  const { t } = useTranslation();

  /** Tipos de serviço do filtro, em cache por 5 minutos. */
  const { data: SERVICE_TYPES = [] } = useQuery({
    queryKey: qk.serviceTypes(),
    queryFn: getServiceTypes,
    staleTime: 5 * 60 * 1000,
  });

  /** Opções do filtro por situação. */
  const STATUS_OPTIONS: { value: InspectionStatus; label: string }[] = [
    { value: "expired", label: t("inspections.filters.statusExpired") },
    { value: "near", label: t("inspections.filters.statusNear") },
    { value: "ok", label: t("inspections.filters.statusOk") },
    { value: "inactive", label: t("inspections.filters.statusInactive") },
  ];

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      alignItems={{ sm: "center" }}
      flexWrap="wrap"
      useFlexGap
      sx={{ mb: 1.5 }}
    >
      <FormField
        placeholder={t("inspections.filters.placeholder.search")}
        value={filters.search}
        onChange={(e) => onChange("search", e.target.value)}
        startIcon={SearchOutlined}
        sx={{ minWidth: { xs: "100%", sm: 350 } }}
      />
      <FormField
        select
        emptyOptionLabel={t("inspections.filters.allServices")}
        value={filters.serviceTypeId}
        onChange={(e) =>
          onChange(
            "serviceTypeId",
            e.target.value === "" ? "" : Number(e.target.value),
          )
        }
        sx={{ width: { xs: "100%", sm: 210 } }}
      >
        {SERVICE_TYPES.map((service) => (
          <MenuItem key={service.id} value={service.id}>
            {service.name}
          </MenuItem>
        ))}
      </FormField>
      <FormField
        select
        emptyOptionLabel={t("inspections.filters.status")}
        value={filters.status}
        onChange={(e) =>
          onChange("status", e.target.value as InspectionStatus | "")
        }
        sx={{ width: { xs: "100%", sm: 140 } }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </FormField>
      <Button
        variant="text"
        tooltip={t("inspections.filters.tooltip.clear")}
        onClick={onClear}
        disabled={!hasActiveFilters}
        startIcon={FilterAltOff}
      >
        {t("inspections.filters.clear")}
      </Button>
      <Button
        tooltip={t("inspections.actions.tooltip.addInspection")}
        startIcon={Add}
        onClick={onAddInspection}
        data-tour="inspections.add"
        sx={{ ml: "auto" }}
      >
        {t("inspections.actions.addInspection")}
      </Button>
    </Stack>
  );
}
