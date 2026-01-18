// src/pages/Configurations.tsx
import { useState } from "react";

type Configuration = {
  name: string;
  value: string;
};

export default function Configurations() {
  const [configs, setConfigs] = useState<Configuration[]>([
    { name: "default_page_size", value: "10" },
    { name: "enable_notifications", value: "true" },
    { name: "system_timezone", value: "America/Sao_Paulo" },
  ]);

  function handleChange(index: number, value: string) {
    const updated = [...configs];
    updated[index].value = value;
    setConfigs(updated);
  }

  return (
    <div className="max-w-3xl bg-principal-white rounded shadow p-6 font-sans">
      {/* TÍTULO */}
      <h2 className="text-xl font-semibold mb-6 text-principal-blue">
        Configurações do sistema
      </h2>

      {/* DESCRIÇÃO */}
      <p className="text-sm text-text-secondary mb-6">
        Ajustes gerais que controlam o comportamento do sistema.
      </p>

      {/* LISTA DE CONFIGS */}
      <div className="space-y-4">
        {configs.map((config, index) => (
          <div
            key={config.name}
            className="border rounded p-4 bg-principal-white"
          >
            <label className="block text-sm text-text-secondary mb-1">
              {config.name}
            </label>

            <input
              value={config.value}
              onChange={(e) => handleChange(index, e.target.value)}
              className="
                w-full
                border
                rounded
                px-3
                py-2
                bg-principal-white
                placeholder:text-text-secondary
                focus:outline-none
                focus:ring-2
                focus:ring-principal-blue
                transition
              "
            />
          </div>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="mt-8 flex justify-end">
        <button
          className="
            bg-principal-blue
            text-principal-white
            px-5
            py-2
            rounded
            hover:bg-principal-green
            transition
          "
        >
          Salvar configurações
        </button>
      </div>
    </div>
  );
}