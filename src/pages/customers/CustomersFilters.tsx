type Props = {
  search: string;
  setSearch: (v: string) => void;

  city: string;
  setCity: (v: string) => void;

  isCustomer: string;
  setIsCustomer: (v: string) => void;

  month: string;
  setMonth: (v: string) => void;

  onClearFilters: () => void;
};

export function CustomersFilters({
  search,
  setSearch,
  city,
  setCity,
  isCustomer,
  setIsCustomer,
  month,
  setMonth,
  onClearFilters,
}: Props) {
  return (
    <div className="bg-principal-white border rounded px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* BUSCA */}
        <input
          placeholder="Buscar por razão social, CNPJ ou cidade"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-80"
        />

        {/* CIDADE */}
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-principal-white"
        >
          <option value="">Todas as cidades</option>
          <option value="São Paulo">São Paulo</option>
          <option value="Campinas">Campinas</option>
        </select>

        {/* CLIENTE */}
        <select
          value={isCustomer}
          onChange={(e) => setIsCustomer(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-principal-white"
        >
          <option value="">Cliente?</option>
          <option value="true">Sim</option>
          <option value="false">Não</option>
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
          className="ml-2 text-sm px-3 py-2 rounded border text-text-secondary hover:bg-offWhite transition"
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}