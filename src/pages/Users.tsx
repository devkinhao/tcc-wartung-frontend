// src/pages/Users.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ===== TIPOS ===== */
type User = {
  id: number;
  username: string;
  fullName: string;
  cpf: string;
  email: string;
  creaNumber?: string;
  avatarUrl?: string;
  active: boolean;
};

type SortKey = keyof Pick<User, "fullName" | "email" | "username">;

/* ===== COMPONENTES AUX ===== */
const SortIcon = ({
  active,
  direction,
}: {
  active: boolean;
  direction: "asc" | "desc";
}) => (
  <span className="ml-1 text-xs opacity-60">
    {active ? (direction === "asc" ? "▲" : "▼") : "⇅"}
  </span>
);

/* ===== COMPONENTE ===== */
export default function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState<SortKey | null>("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Fecha menu ao clicar fora */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* MOCK FETCH */
  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers([
        {
          id: 1,
          username: "admin",
          fullName: "Administrador do Sistema",
          cpf: "000.000.000-00",
          email: "admin@sistema.com",
          active: true,
        },
        {
          id: 2,
          username: "joao.silva",
          fullName: "João da Silva",
          cpf: "111.111.111-11",
          email: "joao@email.com",
          active: false,
        },
      ]);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  /* FILTRO */
  const filtered = useMemo(() => {
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  /* SORT */
  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortBy]?.toString().toLowerCase() ?? "";
      const bVal = b[sortBy]?.toString().toLowerCase() ?? "";
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (column: SortKey) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-principal-blue">Usuários</h1>
        <button className="bg-principal-blue text-principal-white px-4 py-2 rounded hover:bg-principal-green transition">
          + Novo usuário
        </button>
      </div>

      {/* FILTRO */}
      <div className="bg-principal-white border rounded px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <input
          placeholder="Buscar por nome, e-mail ou usuário"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full md:w-80"
        />
        <div className="flex items-center gap-2 text-sm">
          <span>Linhas:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {[5, 10, 20, 50].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-principal-white border rounded shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-offWhite">
            <tr>
              <th
                onClick={() => handleSort("fullName")}
                className="px-4 py-3 text-left cursor-pointer"
              >
                Nome <SortIcon active={sortBy === "fullName"} direction={sortDir} />
              </th>
              <th
                onClick={() => handleSort("email")}
                className="px-4 py-3 text-left cursor-pointer"
              >
                E-mail <SortIcon active={sortBy === "email"} direction={sortDir} />
              </th>
              <th
                onClick={() => handleSort("username")}
                className="px-4 py-3 text-left cursor-pointer"
              >
                Usuário <SortIcon active={sortBy === "username"} direction={sortDir} />
              </th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-text-secondary">
                  Carregando usuários...
                </td>
              </tr>
            )}

            {!loading && paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-text-secondary">
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}

            {!loading &&
              paginated.map((user) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate(`/users/${user.id}`)}
                >
                  <td className="px-4 py-3 text-text-default">
                    {user.fullName}
                  </td>
                  <td className="px-4 py-3 text-text-default">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-text-default">
                    {user.username}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {user.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>

                  {/* AÇÕES */}
                  <td
                    className="px-4 py-3 text-center relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === user.id ? null : user.id)
                      }
                      className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2
                                w-10 h-10 flex items-center justify-center
                                rounded-full hover:bg-offWhite transition"
                    >
                      ⋮
                    </button>

                    {openMenuId === user.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-4 top-8 bg-principal-white border rounded shadow-md w-44 z-10"
                      >
                        <button
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="block w-full text-left px-4 py-2 hover:bg-offWhite transition"
                        >
                          Ver cadastro
                        </button>
                        <button className="block w-full text-left px-4 py-2 hover:bg-offWhite transition">
                          {user.active ? "Inativar usuário" : "Reativar usuário"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* PAGINAÇÃO */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50 transition"
        >
          Anterior
        </button>
        <span>
          Página {page} de {totalPages || 1}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50 transition"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}