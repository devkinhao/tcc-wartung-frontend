import { Pagination } from "@/components/Pagination";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { PageHeader } from "@/layout/header/PageHeader";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";
import { Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { AddCompanyModal } from "../components/AddCompanyModal";
import { CustomersFilters } from "../components/CustomersFilters";
import { CustomersTable } from "../components/CustomersTable";
import { useCities } from "../hooks/useCities";
import { useCustomers } from "../hooks/useCustomers";

/** Página de listagem de clientes, com filtros, ordenação, paginação e cadastro. */
export default function CustomersListPage() {
  /** Hooks. */
  const { t } = useTranslation();
  const cities = useCities();
  const {
    customers,
    loading,
    total,
    filters,
    setFilter,
    hasActiveFilters,
    clearFilters,
    pagination,
    sort,
  } = useCustomers();

  /** Estados. */
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  /** Links externos, como os cards do dashboard, abrem a lista de empresas já filtrada por status. */
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    const isStatusFilter =
      urlStatus && ["customer", "non-customer", "inactive"].includes(urlStatus);

    if (isStatusFilter || urlStatus === "all") {
      clearFilters();
      if (isStatusFilter) {
        setFilter("status", urlStatus);
      }
      const next = new URLSearchParams(searchParams);
      next.delete("status");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, clearFilters, setFilter, setSearchParams]);

  /** Restaura a posição de rolagem da lista ao voltar para esta página. */
  useScrollRestoration("customers-list.scrollY", !loading);

  return (
    <Stack>
      <PageHeader
        items={breadcrumbMap[paths.customers]}
        subtitle={t("customers.description")}
      />
      <CustomersFilters
        values={filters}
        onChange={setFilter}
        cities={cities}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
        onAddCompany={() => setIsAddOpen(true)}
      />
      <CustomersTable
        customers={customers}
        loading={loading}
        sortBy={sort.by}
        sortDir={sort.dir}
        onSort={sort.handle}
      />
      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={total}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
      {/** Modal para adição de uma nova empresa à lista atual. */}
      <AddCompanyModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        cities={cities}
      />
    </Stack>
  );
}
