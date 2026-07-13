import { useState } from "react";
import {
  Box, Chip, CircularProgress, Table, TableBody,
  TableCell, TableHead, TableRow, Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Customer } from "./types/customersList";
import { CustomersRowMenu } from "./CustomersRowMenu";
import { AbvtexChip } from "./components/AbvtexChip";
import { SortableHeader } from "@/components/SortableHeader";
import { formatDateBR, addDaysISODate, todayISODate } from "@/utils/date";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";

type ExpirationStatus = "expired" | "near" | "ok";

function getExpirationStatus(expirationDate: string | null | undefined, alertDays: number): ExpirationStatus | null {
  if (!expirationDate) return null;
  const exp           = expirationDate.split("T")[0];
  const today          = todayISODate();
  const alertThreshold = addDaysISODate(today, alertDays);

  if (exp < today)           return "expired";
  if (exp <= alertThreshold) return "near";
  return "ok";
}

type Props = {
  customers: Customer[];
  loading: boolean;
  sortBy: keyof Customer | null;
  sortDir: "asc" | "desc";
  onSort: (c: keyof Customer) => void;
  onRowClick: (id: number) => void;
};

export function CustomersTable({ customers, loading, sortBy, sortDir, onSort, onRowClick }: Props) {
  const { t } = useTranslation();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const alertDays = useAlertDays();

  const sharedSortProps = { sortBy, sortDir, onSort };

  return (
    <Box
      sx={{
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Table size="small" sx={{ tableLayout: "fixed" }}>
        <TableHead sx={{ bgcolor: "background.default" }}>
          <TableRow>
            <SortableHeader label={t("customers.table.legalName")} column="legalName" {...sharedSortProps} width="20%" />
            <SortableHeader label={t("customers.table.cnpj")} column="cnpj" {...sharedSortProps} width="17%" />
            <SortableHeader label={t("customers.table.city")} column="city" {...sharedSortProps} width="15%" />
            <SortableHeader label={t("customers.table.isCustomer")} column="isCustomer" {...sharedSortProps} align="center" width="9%" />
            <SortableHeader label={t("customers.table.abvtex")} column="abvtexSeal" {...sharedSortProps} align="center" width="12%" />
            <SortableHeader label={t("customers.table.activeInspections")} column="activeInspections" {...sharedSortProps} align="center" width="12%" />
            <SortableHeader label={t("customers.table.nextExpiration")} column="nextExpirationDate" {...sharedSortProps} align="center" width="12%" />
            <TableCell align="right" sx={{ width: "5%" }} />
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5 }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">{t("customers.loading")}</Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">{t("customers.empty")}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((c) => {
              const expStatus = getExpirationStatus(c.nextExpirationDate, alertDays);
              const chipColor =
                expStatus === "expired" ? "#c65b4a" : expStatus === "near" ? "#e0a83f" : null;

              return (
                <TableRow key={c.id} hover sx={{ cursor: "pointer" }} onClick={() => onRowClick(c.id)}>
                  <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.legalName}>
                    {c.legalName}
                  </TableCell>
                  <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.cnpj}>{c.cnpj}</TableCell>
                  <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.city}>
                    {c.city}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={c.isCustomer ? t("common.yes") : t("common.no")}
                      color={c.isCustomer ? "success" : "default"}
                      variant={c.isCustomer ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell align="center"><AbvtexChip seal={c.abvtexSeal} /></TableCell>
                  <TableCell align="center">{c.activeInspections}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    {chipColor ? (
                      <Chip
                        size="small"
                        label={formatDateBR(c.nextExpirationDate)}
                        sx={{
                          bgcolor: chipColor,
                          color: expStatus === "expired" ? "#fff" : "#000",
                          fontWeight: 600,
                        }}
                      />
                    ) : (
                      formatDateBR(c.nextExpirationDate)
                    )}
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()} sx={{ width: "5%" }}>
                    <CustomersRowMenu
                      customerId={c.id}
                      open={openMenuId === c.id}
                      onToggle={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                      onClose={() => setOpenMenuId(null)}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Box>
  );
}