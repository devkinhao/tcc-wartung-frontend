import {
  Box, Chip, CircularProgress, TableBody,
  TableCell, TableHead, TableRow, Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Customer } from "./types/customersList";
import { CustomersRowActions } from "./CustomersRowActions";
import { AbvtexChip } from "./components/AbvtexChip";
import { SortableHeader } from "@/components/SortableHeader";
import { ExpirationChip } from "@/components/ExpirationChip";
import { DataTableContainer } from "@/components/DataTableContainer";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";

type Props = {
  customers: Customer[];
  loading: boolean;
  sortBy: keyof Customer | null;
  sortDir: "asc" | "desc";
  onSort: (c: keyof Customer) => void;
};

export function CustomersTable({ customers, loading, sortBy, sortDir, onSort }: Props) {
  const { t } = useTranslation();
  const alertDays = useAlertDays();

  const sharedSortProps = { sortBy, sortDir, onSort };

  return (
    <DataTableContainer>
        <TableHead sx={{ bgcolor: "background.default" }}>
          <TableRow>
            <SortableHeader label={t("customers.table.legalName")} column="legalName" {...sharedSortProps} width="18%" />
            <SortableHeader label={t("customers.table.cnpj")} column="cnpj" {...sharedSortProps} width="15%" />
            <SortableHeader label={t("customers.table.city")} column="city" {...sharedSortProps} width="13%" />
            <SortableHeader label={t("customers.table.isCustomer")} column="isCustomer" {...sharedSortProps} align="center" width="8%" />
            <SortableHeader label={t("customers.table.abvtex")} column="abvtexSeal" {...sharedSortProps} align="center" width="11%" />
            <SortableHeader label={t("customers.table.activeInspections")} column="activeInspections" {...sharedSortProps} align="center" width="10%" />
            <SortableHeader label={t("customers.table.nextExpiration")} column="nextExpirationDate" {...sharedSortProps} align="center" width="13%" />
            <TableCell align="center" sx={{ width: "12%" }}><b>{t("customers.table.actions")}</b></TableCell>
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
                <TableRow key={c.id}>
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
                    <ExpirationChip date={c.nextExpirationDate} alertDays={alertDays} />
                  </TableCell>
                  <TableCell align="right" sx={{ width: "12%" }}>
                    <CustomersRowActions customerId={c.id} />
                  </TableCell>
                </TableRow>
            ))
          )}
        </TableBody>
    </DataTableContainer>
  );
}