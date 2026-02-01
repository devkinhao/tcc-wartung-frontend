import { usePreferences } from "@/contexts/PreferencesContext";
import { useQuery } from "@tanstack/react-query";
import { getPreferenceOptions } from "@/services/userPreferenceService";

const labels: Record<string, { title: string; description: string }> = {
  LANGUAGE: {
    title: "Idioma",
    description: "Idioma utilizado na interface do sistema",
  },
  THEME: {
    title: "Tema",
    description: "Tema visual do sistema",
  },
};

export default function UserPreferences() {
  const { preferences, setPreference, isLoading } = usePreferences();

  const { data: options, isLoading: loadingOptions } = useQuery({
    queryKey: ["preference-options"],
    queryFn: getPreferenceOptions,
    staleTime: Infinity,
  });

  if (isLoading || loadingOptions || !options) {
    return (
      <div className="text-text-secondary font-sans">
        Carregando preferências...
      </div>
    );
  }

  return (
    <div className="max-w-4xl bg-principal-white border border-offWhite rounded shadow p-6 font-sans">
      <h2 className="text-xl font-semibold mb-1 text-text">
        Preferências
      </h2>

      <p className="text-sm text-text-secondary mb-6">
        Personalize o sistema de acordo com suas preferências.
      </p>

      <div className="space-y-4">
        {Object.entries(options).map(([name, values]) => {
          const label = labels[name];

          return (
            <div
              key={name}
              className="
                bg-offWhite
                border border-default
                rounded-lg
                p-4
                flex items-center justify-between
              "
            >
              <div>
                <p className="font-medium text-text">
                  {label?.title ?? name}
                </p>

                <p className="text-sm text-text-secondary">
                  {label?.description ?? ""}
                </p>
              </div>

              <select
                value={preferences[name]}
                onChange={(e) => setPreference(name, e.target.value)}
                className="
                  border border-default
                  rounded-md
                  px-3 py-2
                  text-sm
                  bg-principal-white
                  text-text
                  focus:outline-none
                  focus:ring-2
                  focus:ring-principal-blue
                  transition
                "
              >
                {values.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}