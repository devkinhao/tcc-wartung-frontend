import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

import { useCustomers } from "../hooks/useCustomers";
import { CustomersFilters } from "../CustomersFilters";
import { CustomersTable } from "../CustomersTable";
import { Pagination } from "../../../components/Pagination";
import { useCities } from "../hooks/useCities";
import { AddCompanyModal } from "../AddCompanyModal";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { Breadcrumb } from "@/layout/header/Breadcrumb";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";

export default function CustomersListPage() {
  const { t } = useTranslation();
  const cities = useCities();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { customers, loading, total, filters, setFilter, hasActiveFilters, clearFilters, pagination, sort } =
    useCustomers();

  useScrollRestoration("customers-list.scrollY", !loading);

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Breadcrumb items={breadcrumbMap[paths.customers]} size="large" />
        <Typography variant="body2" color="text.secondary">
          {t("customers.description")}
        </Typography>
      </Box>

      <AddCompanyModal open={isAddOpen} onClose={() => setIsAddOpen(false)} cities={cities} />

      <CustomersFilters
        values={filters}
        onChange={setFilter}
        cities={cities}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddOpen(true)}>
            {t("customers.actions.addCompany")}
          </Button>
        }
      />

      <CustomersTable
        customers={customers}
        loading={loading}
        sortBy={sort.by}
        sortDir={sort.dir}
        onSort={sort.handle}
      />

      <Box sx={{ mt: 1 }}>
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={total}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      </Box>
    </Box>
  );
}
