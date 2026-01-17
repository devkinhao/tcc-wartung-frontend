export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          Serviços mais solicitados
        </div>
        <div className="p-4 bg-white rounded shadow">
          Clientes por cidade
        </div>
        <div className="p-4 bg-white rounded shadow">
          Inspeções
        </div>
      </div>
    </div>
  );
}
