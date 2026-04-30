import { useState } from "react";
import {
  Box, Chip, CircularProgress, Table, TableBody,
  TableCell, TableHead, TableRow, TableSortLabel, Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Customer } from "./types/customersList";
import { CustomersRowMenu } from "./CustomersRowMenu";
import { AbvtexChip } from "./components/AbvtexChip";
import { formatDateBR } from "@/utils/date";

type SortableHeaderProps = {
  label: string;
  column: keyof Customer;
  sortBy: keyof Customer | null;
  sortDir: "asc" | "desc";
  onSort: (c: keyof Customer) => void;
  align?: "left" | "center" | "right";
};

function SortableHeader({ label, column, sortBy, sortDir, onSort, align = "left" }: SortableHeaderProps) {
  const active = sortBy === column;
  return (
    <TableCell
      align={align}
      onClick={() => onSort(column)}
      sx={{ cursor: "pointer", userSelect: "none" }}
    >
      <TableSortLabel active={active} direction={active ? sortDir : "asc"}>
        <b>{label}</b>
      </TableSortLabel>
    </TableCell>
  );
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

  const sharedSortProps = { sortBy, sortDir, onSort };

  return (
    <Box sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 2, overflow: "hidden", bgcolor: "background.paper" }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: "background.default" }}>
          <TableRow>
            <SortableHeader label={t("customers.table.legalName")} column="legalName" {...sharedSortProps} />
            <SortableHeader label={t("customers.table.cnpj")} column="cnpj" {...sharedSortProps} />
            <SortableHeader label={t("customers.table.city")} column="city" {...sharedSortProps} />
            <TableCell align="center"><b>{t("customers.table.isCustomer")}</b></TableCell>
            <TableCell align="center"><b>{t("customers.table.abvtex")}</b></TableCell>
            <SortableHeader label={t("customers.table.activeInspections")} column="activeInspections" {...sharedSortProps} align="center" />
            <SortableHeader label={t("customers.table.nextExpiration")} column="nextExpirationDate" {...sharedSortProps} align="center" />
            <TableCell align="right" />
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
            customers.map((c) => (
              <TableRow key={c.id} hover sx={{ cursor: "pointer" }} onClick={() => onRowClick(c.id)}>
                <TableCell>{c.legalName}</TableCell>
                <TableCell>{c.cnpj}</TableCell>
                <TableCell>{c.city}</TableCell>
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
                <TableCell align="center">{formatDateBR(c.nextExpirationDate)}</TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()} sx={{ width: 48 }}>
                  <CustomersRowMenu
                    customerId={c.id}
                    open={openMenuId === c.id}
                    onToggle={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                    onClose={() => setOpenMenuId(null)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
}