import {
  Box, Chip, CircularProgress, TableBody,
  TableCell, TableHead, TableRow, Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Customer } from "../types/customersList";
import { AbvtexChip } from "./AbvtexChip";
import { SortableHeader } from "@/components/SortableHeader";
import { ExpirationChip } from "@/components/ExpirationChip";
import { DataTableContainer } from "@/components/DataTableContainer";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";
import { saveScrollPosition } from "@/hooks/useScrollRestoration";
import { paths } from "@/routes/paths";

type Props = {
  customers: Customer[];
  loading: boolean;
  sortBy: keyof Customer | null;
  sortDir: "asc" | "desc";
  onSort: (c: keyof Customer) => void;
};

export function CustomersTable({ customers, loading, sortBy, sortDir, onSort }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const alertDays = useAlertDays();

  const sharedSortProps = { sortBy, sortDir, onSort };

  const openDetails = (id: number) => {
    saveScrollPosition("customers-list.scrollY");
    navigate(paths.customerDetails(id));
  };

  return (
    <DataTableContainer>
        <TableHead sx={{ bgcolor: "background.default" }}>
          <TableRow>
            <SortableHeader label={t("customers.table.legalName")} column="legalName" {...sharedSortProps} width="24%" />
            <SortableHeader label={t("customers.table.cnpj")} column="cnpj" {...sharedSortProps} width="16%" />
            <SortableHeader label={t("customers.table.city")} column="city" {...sharedSortProps} width="14%" />
            <SortableHeader label={t("customers.table.isCustomer")} column="isCustomer" {...sharedSortProps} align="center" width="10%" />
            <SortableHeader label={t("customers.table.abvtex")} column="abvtexSeal" {...sharedSortProps} align="center" width="12%" />
            <SortableHeader label={t("customers.table.activeInspections")} column="activeInspections" {...sharedSortProps} align="center" width="12%" />
            <SortableHeader label={t("customers.table.nextExpiration")} column="nextExpirationDate" {...sharedSortProps} align="center" width="12%" />
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5 }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">{t("customers.loading")}</Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                <Typography variant="body2" color="text.secondary">{t("customers.empty")}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((c) => (
                <TableRow
                  key={c.id}
                  hover
                  sx={{
                    cursor: "pointer",
                    ...(!c.isActive && {
                      bgcolor: "action.hover",
                      "& td": { color: "text.disabled" },
                    }),
                  }}
                  onClick={() => openDetails(c.id)}
                >
                  <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.legalName}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden" }}>
                      <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.legalName}
                      </Box>
                      {!c.isActive && (
                        <Chip size="small" variant="outlined" label={t("customers.table.inactive")} />
                      )}
                    </Box>
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
                </TableRow>
            ))
          )}
        </TableBody>
    </DataTableContainer>
  );
}
