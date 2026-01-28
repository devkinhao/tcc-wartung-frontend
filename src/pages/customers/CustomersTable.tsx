import { Customer } from "./types";
import { abvtexLabel, abvtexStyles } from "./constants";
import { CustomersRowMenu } from "./CustomersRowMenu";
import { SortIcon } from "../../components/SortIcon";
import { useState } from "react";

type Props = {
  customers: Customer[];
  loading: boolean;
  sortBy: keyof Customer | null;
  sortDir: "asc" | "desc";
  onSort: (c: keyof Customer) => void;
  onRowClick: (id: number) => void;
};

export function CustomersTable({
  customers,
  loading,
  sortBy,
  sortDir,
  onSort,
  onRowClick,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  return (
    <div className="bg-principal-white border rounded shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-offWhite">
          <tr className="border-t cursor-pointer align-middle">
            <th onClick={() => onSort("legalName")} className="px-4 py-3 text-left cursor-pointer">
              Razão social <SortIcon active={sortBy === "legalName"} direction={sortDir} />
            </th>
            <th onClick={() => onSort("cnpj")} className="px-4 py-3 text-left cursor-pointer">
              CNPJ <SortIcon active={sortBy === "cnpj"} direction={sortDir} />
            </th>
            <th onClick={() => onSort("city")} className="px-4 py-3 text-left cursor-pointer">
              Cidade <SortIcon active={sortBy === "city"} direction={sortDir} />
            </th>
            <th className="px-4 py-3 text-center">Cliente?</th>
            <th className="px-4 py-3 text-center">ABVTEX</th>
            <th onClick={() => onSort("activeInspections")} className="px-4 py-3 align-middle text-center cursor-pointer">
              Inspeções Ativas <SortIcon active={sortBy === "activeInspections"} direction={sortDir} />
            </th>
            <th onClick={() => onSort("nextExpirationDate")} className="px-4 py-3 align-middle text-center cursor-pointer">
              Próximo Vencimento <SortIcon active={sortBy === "nextExpirationDate"} direction={sortDir} />
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={8} className="px-4 py-2 align-middle text-center text-text-secondary">
                Carregando clientes...
              </td>
            </tr>
          )}

          {!loading && customers.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-2 align-middle text-center text-text-secondary">
                Nenhum cliente encontrado
              </td>
            </tr>
          )}

          {!loading &&
            customers.map((c) => (
              <tr
                key={c.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick(c.id)}
              >
                <td className="px-4 py-3 align-middle">{c.legalName}</td>
                <td className="px-4 py-3 align-middle">{c.cnpj}</td>
                <td className="px-4 py-3 align-middle">{c.city}</td>
                <td className="px-4 py-3 align-middle text-center">
                  <span className={`px-2 py-1 rounded text-xs ${c.isCustomer ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {c.isCustomer ? "Sim" : "Não"}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle text-center">
                  <span className={`px-2 py-1 rounded text-xs ${abvtexStyles[c.abvtexSeal]}`}>
                    {abvtexLabel[c.abvtexSeal]}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-text-default">{c.activeInspections}</td>
                <td className="px-4 py-3 align-middle text-center">
                  {c.nextExpirationDate 
                    ? c.nextExpirationDate.split('-').reverse().join('/') 
                    : "—"}
                </td>
                <td
                  className="px-4 py-2 align-middle"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CustomersRowMenu
                    open={openMenuId === c.id}
                    onToggle={() =>
                      setOpenMenuId(openMenuId === c.id ? null : c.id)
                    }
                    onClose={() => setOpenMenuId(null)}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}