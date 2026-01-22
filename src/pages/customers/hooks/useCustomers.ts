// src/pages/customers/hooks/useCustomers.ts
import { useEffect, useMemo, useState } from "react";
import { Customer } from "../types";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [isCustomer, setIsCustomer] = useState("");
  const [month, setMonth] = useState("");

  const [sortBy, setSortBy] = useState<keyof Customer | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCustomers([
        {
          id: 1,
          legalName: "Empresa Exemplo LTDA",
          cnpj: "12.345.678/0001-90",
          city: "São Paulo",
          isCustomer: true,
          abvtexSeal: "OURO",
          activeInspections: 2,
          nextExpirationDate: "2026-03-15",
        },
        {
          id: 2,
          legalName: "Indústria Modelo S.A.",
          cnpj: "98.765.432/0001-10",
          city: "Campinas",
          isCustomer: false,
          abvtexSeal: "NAO_POSSUI",
          activeInspections: 0,
          nextExpirationDate: "2025-11-02",
        },
        {
          id: 3,
          legalName: "Empresa Exemplo LTDA",
          cnpj: "12.345.678/0001-90",
          city: "São Paulo",
          isCustomer: true,
          abvtexSeal: "OURO",
          activeInspections: 2,
          nextExpirationDate: "2026-03-15",
        },
        {
          id: 4,
          legalName: "Indústria Modelo S.A.",
          cnpj: "98.765.432/0001-10",
          city: "Campinas",
          isCustomer: false,
          abvtexSeal: "NAO_POSSUI",
          activeInspections: 0,
          nextExpirationDate: "2025-11-02",
        },
        {
          id: 5,
          legalName: "Empresa Exemplo LTDA",
          cnpj: "12.345.678/0001-90",
          city: "São Paulo",
          isCustomer: true,
          abvtexSeal: "OURO",
          activeInspections: 2,
          nextExpirationDate: "2026-03-15",
        },
        {
          id: 6,
          legalName: "Indústria Modelo S.A.",
          cnpj: "98.765.432/0001-10",
          city: "Campinas",
          isCustomer: false,
          abvtexSeal: "NAO_POSSUI",
          activeInspections: 0,
          nextExpirationDate: "2025-11-02",
        },
        {
          id: 7,
          legalName: "Empresa Exemplo LTDA",
          cnpj: "12.345.678/0001-90",
          city: "São Paulo",
          isCustomer: true,
          abvtexSeal: "OURO",
          activeInspections: 2,
          nextExpirationDate: "2026-04-15",
        },
        {
          id: 8,
          legalName: "Indústria Modelo S.A.",
          cnpj: "98.765.432/0001-10",
          city: "Campinas",
          isCustomer: false,
          abvtexSeal: "NAO_POSSUI",
          activeInspections: 0,
          nextExpirationDate: "2025-10-02",
        },
        {
          id: 9,
          legalName: "Empresa Exemplo LTDA",
          cnpj: "12.345.678/0001-90",
          city: "São Paulo",
          isCustomer: true,
          abvtexSeal: "OURO",
          activeInspections: 2,
          nextExpirationDate: "2026-02-15",
        },
        {
          id: 10,
          legalName: "Indústria Modelo S.A.",
          cnpj: "98.765.432/0001-10",
          city: "Campinas",
          isCustomer: false,
          abvtexSeal: "NAO_POSSUI",
          activeInspections: 0,
          nextExpirationDate: "2025-12-02",
        },
        {
          id: 11,
          legalName: "Empresa Exemplo LTDA",
          cnpj: "12.345.678/0001-90",
          city: "São Paulo",
          isCustomer: true,
          abvtexSeal: "OURO",
          activeInspections: 2,
          nextExpirationDate: "2026-03-15",
        },
        {
          id: 12,
          legalName: "Indústria Modelo S.A.",
          cnpj: "98.765.432/0001-10",
          city: "Campinas",
          isCustomer: false,
          abvtexSeal: "NAO_POSSUI",
          activeInspections: 0,
          nextExpirationDate: "2025-11-02",
        },
      ]);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
  return customers.filter((c) => {
    const matchesSearch =
      c.legalName.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase());

    const matchesCity =
      !city || c.city === city;

    const matchesCustomer =
      !isCustomer || String(c.isCustomer) === isCustomer;

    const matchesMonth =
      !month ||
      new Date(c.nextExpirationDate).getMonth() + 1 === Number(month);

    return (
      matchesSearch &&
      matchesCity &&
      matchesCustomer &&
      matchesMonth
    );
  });
}, [customers, search, city, isCustomer, month]);

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortBy, sortDir]);

  const totalRecords = sorted.length;

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const handleSort = (column: keyof Customer) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  const hasActiveFilters =
    search !== "" ||
    city !== "" ||
    isCustomer !== "" ||
    month !== "";

  const clearFilters = () => {
    setSearch("");
    setCity("");
    setIsCustomer("");
    setMonth("");
    setPage(1);
  };

  return {
    customers: paginated,
    loading,

    search,
    setSearch,

    city,
    setCity,

    isCustomer,
    setIsCustomer,

    month,
    setMonth,

    page,
    setPage,
    pageSize,
    setPageSize,

    sortBy,
    sortDir,
    handleSort,
    totalRecords,

    hasActiveFilters,
    clearFilters,
  };
}