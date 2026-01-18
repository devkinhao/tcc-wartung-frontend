import { useState } from "react";

type Report = {
  id: string;
  title: string;
  description: string;
};

export default function Reports() {
  const [reports] = useState<Report[]>([
    {
      id: "inspections_due",
      title: "Inspeções a vencer",
      description: "Lista de inspeções que vencem nos próximos dias.",
    },
    {
      id: "inspections_overdue",
      title: "Inspeções vencidas",
      description: "Inspeções com prazo expirado.",
    },
    {
      id: "inspections_by_period",
      title: "Inspeções por período",
      description: "Relatório de inspeções em um intervalo de datas.",
    },
  ]);

  function handleGenerate(reportId: string) {
    console.log("Gerar relatório:", reportId);
    // futuramente:
    // GET /reports/{id}?params...
  }

  return (
    <div className="max-w-4xl bg-principal-white rounded shadow p-6 font-sans">
      <h2 className="text-xl font-semibold mb-6 text-principal-blue">
        Relatórios
      </h2>

      <p className="text-sm text-text-secondary mb-6">
        Gere relatórios do sistema para análise ou exportação.
      </p>

      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="border rounded p-4 bg-principal-white"
          >
            <h3 className="text-base font-medium text-text-default">
              {report.title}
            </h3>

            <p className="text-sm text-text-secondary mt-1">
              {report.description}
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => handleGenerate(report.id)}
                className="
                  bg-principal-blue
                  text-principal-white
                  px-4
                  py-2
                  rounded
                  text-sm
                  hover:bg-principal-green
                  transition
                "
              >
                Gerar relatório
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}