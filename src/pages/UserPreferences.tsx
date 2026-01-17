import { useEffect, useState } from "react";

type PreferenceOptionMap = Record<string, string[]>;
type UserPreference = {
  name: string;
  value: string;
};

export default function UserPreferences() {
  const [options, setOptions] = useState<PreferenceOptionMap>({});
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // MOCK – depois vira fetch
    setTimeout(() => {
      const availableOptions: PreferenceOptionMap = {
        LANGUAGE: ["pt_BR", "en_US", "de_DE"],
        THEME: ["light", "dark"],
      };

      const userPrefs: UserPreference[] = [
        { name: "LANGUAGE", value: "pt_BR" },
        { name: "THEME", value: "light" },
      ];

      setOptions(availableOptions);
      setPreferences(userPrefs);
      setLoading(false);
    }, 400);
  }, []);

  const handleChange = (name: string, value: string) => {
    setPreferences((prev) =>
      prev.map((p) => (p.name === name ? { ...p, value } : p))
    );
  };

  const handleSave = () => {
    console.log("Salvar preferências:", preferences);
    alert("Preferências salvas (mock)");
  };

  if (loading) {
    return <div className="text-gray-500">Carregando preferências...</div>;
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold mb-1">Preferências</h2>
      <p className="text-sm text-gray-600 mb-6">
        Personalize o sistema de acordo com suas preferências.
      </p>

      <div className="space-y-4">
        {preferences.map((pref) => (
          <div
            key={pref.name}
            className="bg-white border rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium">
                {pref.name === "LANGUAGE" && "Idioma"}
                {pref.name === "THEME" && "Tema"}
              </p>
              <p className="text-sm text-gray-500">
                {pref.name === "LANGUAGE" &&
                  "Idioma utilizado na interface do sistema"}
                {pref.name === "THEME" &&
                  "Tema visual do sistema"}
              </p>
            </div>

            <select
              value={pref.value}
              onChange={(e) => handleChange(pref.name, e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              {options[pref.name]?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700"
        >
          Salvar alterações
        </button>
      </div>
    </div>
  );
}
