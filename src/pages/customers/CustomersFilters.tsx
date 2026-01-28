type Props = {
  search: string;
  setSearch: (v: string) => void;

  city: string;
  setCity: (v: string) => void;

  cities: City[];

  isCustomer: string;
  setIsCustomer: (v: string) => void;

  month: string;
  setMonth: (v: string) => void;

  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export function CustomersFilters({
  search,
  setSearch,
  city,
  setCity,
  cities,
  isCustomer,
  setIsCustomer,
  month,
  setMonth,
  hasActiveFilters,
  onClearFilters,
}: Props) {
  return (
    <div className="bg-principal-white border rounded px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* BUSCA */}
        <input
          placeholder="Buscar por razão social ou CNPJ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-80"
        />

        {/* CIDADE DINÂMICA */}
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-principal-white min-w-[150px]"
        >
          <option value="">Todas as cidades</option>
          {cities.map((c) => (
            // Use c.id para a key e c.name para o valor/texto
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* MÊS */}
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-principal-white"
        >
          <option value="">Todos os meses</option>
          <option value="1">Janeiro</option>
          <option value="2">Fevereiro</option>
          <option value="3">Março</option>
          <option value="4">Abril</option>
          <option value="5">Maio</option>
          <option value="6">Junho</option>
          <option value="7">Julho</option>
          <option value="8">Agosto</option>
          <option value="9">Setembro</option>
          <option value="10">Outubro</option>
          <option value="11">Novembro</option>
          <option value="12">Dezembro</option>
        </select>

        {/* LIMPAR */}
        <button
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className={`
            px-3 py-2 text-sm rounded border transition
            ${
              hasActiveFilters
                ? "text-principal-blue border-principal-blue hover:bg-offWhite"
                : "text-gray-400 border-gray-200 cursor-not-allowed"
            }
          `}
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}