import { useEffect, useMemo, useRef, useState } from "react";

/* ===== TIPOS ===== */

export type AbvtexSealType =
  | "NAO_POSSUI"
  | "COBRE"
  | "BRONZE"
  | "PRATA"
  | "OURO";

type Customer = {
  id: number;
  legalName: string;
  cnpj: string;
  city: string;
  isCustomer: boolean;
  abvtexSeal: AbvtexSealType;
  activeInspections: number;
  nextExpirationDate: string;
};

/* ===== HELPERS ===== */

const abvtexStyles: Record<AbvtexSealType, string> = {
  NAO_POSSUI: "bg-gray-200 text-gray-600",
  COBRE: "bg-orange-100 text-orange-700",
  BRONZE: "bg-amber-200 text-amber-800",
  PRATA: "bg-slate-200 text-slate-700",
  OURO: "bg-yellow-200 text-yellow-800",
};

const abvtexLabel: Record<AbvtexSealType, string> = {
  NAO_POSSUI: "Não possui",
  COBRE: "Cobre",
  BRONZE: "Bronze",
  PRATA: "Prata",
  OURO: "Ouro",
};

const SortIcon = ({ active, direction }: { active: boolean; direction: "asc" | "desc" }) => (
  <span className="ml-1 text-xs opacity-60">
    {active ? (direction === "asc" ? "▲" : "▼") : "⇅"}
  </span>
);

/* ===== COMPONENTE ===== */

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<keyof Customer | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {

  const timer = setTimeout(() => {
    const response: Customer[] = [
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
    ];

    setCustomers(response);
    setLoading(false);
  }, 600);

  return () => clearTimeout(timer);
}, []);


  const filtered = useMemo(() => {
    return customers.filter((c) =>
      c.legalName.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

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

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (column: keyof Customer) => {
    if (sortBy === column) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  const handleRowClick = (id: number) => {
    console.log("Abrir detalhes do cliente", id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">+ Adicionar cliente</button>
      </div>

      <div className="bg-white border rounded px-4 py-3 flex items-center justify-between">
        <input
          placeholder="Buscar por razão social, CNPJ ou cidade"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-80"
        />
        <div className="flex items-center gap-2 text-sm">
          <span>Linhas:</span>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border rounded px-2 py-1">
            {[5, 10, 20, 50].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded border overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th onClick={() => handleSort("legalName")} className="px-4 py-3 text-left cursor-pointer">Razão social<SortIcon active={sortBy === "legalName"} direction={sortDir} /></th>
              <th onClick={() => handleSort("cnpj")} className="px-4 py-3 text-left cursor-pointer">CNPJ<SortIcon active={sortBy === "cnpj"} direction={sortDir} /></th>
              <th onClick={() => handleSort("city")} className="px-4 py-3 text-left cursor-pointer">Cidade<SortIcon active={sortBy === "city"} direction={sortDir} /></th>
              <th className="px-4 py-3 text-center">Cliente?</th>
              <th className="px-4 py-3 text-center">ABVTEX</th>
              <th onClick={() => handleSort("activeInspections")} className="px-4 py-3 text-center cursor-pointer">Inspeções<SortIcon active={sortBy === "activeInspections"} direction={sortDir} /></th>
              <th onClick={() => handleSort("nextExpirationDate")} className="px-4 py-3 text-left cursor-pointer">Vencimento<SortIcon active={sortBy === "nextExpirationDate"} direction={sortDir} /></th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  Carregando clientes...
                </td>
              </tr>
            )}
            {!loading && paginated.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  Nenhum cliente encontrado
                </td>
              </tr>
            )}

            {!loading && paginated.map((customer) => (
              <tr key={customer.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(customer.id)}>
                <td className="px-4 py-3">{customer.legalName}</td>
                <td className="px-4 py-3">{customer.cnpj}</td>
                <td className="px-4 py-3">{customer.city}</td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded text-xs ${customer.isCustomer ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>{customer.isCustomer ? "Sim" : "Não"}</span></td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded text-xs ${abvtexStyles[customer.abvtexSeal]}`}>{abvtexLabel[customer.abvtexSeal]}</span></td>
                <td className="px-4 py-3 text-center">{customer.activeInspections}</td>
                <td className="px-4 py-3">{new Date(customer.nextExpirationDate).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)} className="
    absolute
    inset-1/2
    -translate-x-1/2
    -translate-y-1/2
    w-10
    h-10
    flex
    items-center
    justify-center
    rounded-full
    hover:bg-gray-100
  ">⋮</button>
                  {openMenuId === customer.id && (
                    <div ref={menuRef} className="absolute right-4 top-8 bg-white border rounded shadow-md w-40 z-10">
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Ver cliente</button>
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Editar</button>
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Inspeções</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-4 text-sm">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Anterior</button>
        <span>Página {page} de {totalPages || 1}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Próxima</button>
      </div>
    </div>
  );
}