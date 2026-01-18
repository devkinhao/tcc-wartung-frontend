export default function Dashboard() {
  return (
    <div className="max-w-6xl w-full space-y-6 font-sans">
      {/* Título da página */}
      <h2 className="text-xl font-semibold text-principal-blue">Dashboard</h2>

      {/* Grid de widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-principal-white rounded shadow hover:shadow-md transition">
          <h3 className="text-sm font-medium text-text-default mb-2">
            Serviços mais solicitados
          </h3>
          <div className="text-text-secondary text-sm">
            {/* Futuramente gráficos ou listas */}
            Nenhum dado disponível no momento
          </div>
        </div>

        <div className="p-4 bg-principal-white rounded shadow hover:shadow-md transition">
          <h3 className="text-sm font-medium text-text-default mb-2">
            Clientes por cidade
          </h3>
          <div className="text-text-secondary text-sm">
            Nenhum dado disponível no momento
          </div>
        </div>

        <div className="p-4 bg-principal-white rounded shadow hover:shadow-md transition">
          <h3 className="text-sm font-medium text-text-default mb-2">
            Inspeções
          </h3>
          <div className="text-text-secondary text-sm">
            Nenhum dado disponível no momento
          </div>
        </div>
      </div>
    </div>
  );
}