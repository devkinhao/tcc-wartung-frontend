// src/pages/customers/CustomersPage.tsx
import { useCustomers } from "./hooks/useCustomers";
import { CustomersFilters } from "./CustomersFilters";
import { CustomersTable } from "./CustomersTable";
import { Pagination } from "../../components/Pagination";
import { useCities } from "./hooks/useCities";

export default function CustomersPage() {
  const state = useCustomers();
  const cities = useCities();

  return (
    <div className="space-y-6 font-sans pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-principal-blue">Gerenciar Empresas</h1>
        <button className="bg-principal-blue text-principal-white px-4 py-2 rounded hover:bg-principal-green">
          + Adicionar Empresa
        </button>
      </div>

      <CustomersFilters
        search={state.search}
        setSearch={state.setSearch}
        city={state.city}
        setCity={state.setCity}
        cities={cities}
        isCustomer={state.isCustomer}
        setIsCustomer={state.setIsCustomer}
        month={state.month}
        setMonth={state.setMonth}
        hasActiveFilters={state.hasActiveFilters}
        onClearFilters={state.clearFilters}
      />

      <CustomersTable
        customers={state.customers}
        loading={state.loading}
        sortBy={state.sortBy}
        sortDir={state.sortDir}
        onSort={state.handleSort}
        onRowClick={(id) => console.log("Abrir cliente", id)}
      />

      <Pagination
        page={state.page}
        pageSize={state.pageSize}
        total={state.totalRecords}
        onPageChange={state.setPage}
        onPageSizeChange={state.setPageSize}
      />

    </div>
  );
}