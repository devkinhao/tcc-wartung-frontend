import { useEffect, useState } from "react";

/* ===== TYPES ===== */

type City = {
  id: number;
  name: string;
  state: string;
};

type Company = {
  fantasyName: string;
  legalName: string;
  cnpj: string;
  phone: string;
  mobile: string;
  email: string;
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    zipCode: string;
    cityId: number | null;
  };
};

export default function Company() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [cities, setCities] = useState<City[]>([]);
  const [company, setCompany] = useState<Company | null>(null);

  /* ===== MOCK FETCH ===== */
  useEffect(() => {
    setTimeout(() => {
      setCities([
        { id: 1, name: "São Paulo", state: "SP" },
        { id: 2, name: "Campinas", state: "SP" },
        { id: 3, name: "Rio de Janeiro", state: "RJ" },
      ]);

      setCompany({
        fantasyName: "Engenharia Maas",
        legalName: "Engenharia Maas LTDA",
        cnpj: "12.345.678/0001-90",
        phone: "(11) 3333-3333",
        mobile: "(11) 98888-8888",
        email: "contato@engenhariamaas.com.br",
        address: {
          street: "Rua Exemplo",
          number: "123",
          complement: "Sala 45",
          neighborhood: "Centro",
          zipCode: "01000-000",
          cityId: 1,
        },
      });

      setLoading(false);
    }, 500);
  }, []);

  if (loading || !company) {
    return <div className="text-text-secondary">Carregando dados da empresa...</div>;
  }

  const handleChange = (field: keyof Company, value: string) => {
    setCompany((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleAddressChange = (
    field: keyof Company["address"],
    value: string
  ) => {
    setCompany((prev) =>
      prev
        ? { ...prev, address: { ...prev.address, [field]: value } }
        : prev
    );
  };

  const handleSave = () => {
    console.log("Salvar empresa (mock)", company);
    setIsEditing(false);
  };

  return (
    <div className="max-w-5xl bg-principal-white rounded shadow p-6 font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-principal-blue">
          Minha empresa
        </h2>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-principal-blue text-principal-white px-5 py-2 rounded hover:bg-principal-green transition"
          >
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border rounded text-sm text-text-default hover:bg-offWhite transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="bg-principal-blue text-principal-white px-4 py-2 rounded text-sm hover:bg-principal-green transition"
            >
              Salvar alterações
            </button>
          </div>
        )}
      </div>

      {/* DADOS DA EMPRESA */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: "Nome fantasia", value: company.fantasyName, field: "fantasyName" },
          { label: "Razão social", value: company.legalName, field: "legalName" },
          { label: "CNPJ", value: company.cnpj, field: "cnpj" },
          { label: "E-mail", value: company.email, field: "email" },
          { label: "Telefone", value: company.phone, field: "phone" },
          { label: "Celular", value: company.mobile, field: "mobile" },
        ].map((item) => (
          <div key={item.field}>
            <label className="text-sm text-text-secondary">
              {item.label}
            </label>
            <input
              disabled={!isEditing}
              value={item.value}
              onChange={(e) =>
                handleChange(item.field as keyof Company, e.target.value)
              }
              className={`mt-1 w-full border rounded px-3 py-2 placeholder:text-text-secondary ${
                !isEditing
                  ? "bg-offWhite cursor-not-allowed"
                  : "bg-principal-white focus:outline-none focus:ring-2 focus:ring-principal-blue"
              } transition`}
            />
          </div>
        ))}
      </div>

      {/* ENDEREÇO */}
      <h3 className="text-lg font-medium mb-4 text-principal-blue">
        Endereço
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Rua", value: company.address.street, field: "street" },
          { label: "Número", value: company.address.number, field: "number" },
          { label: "Complemento", value: company.address.complement, field: "complement" },
          { label: "Bairro", value: company.address.neighborhood, field: "neighborhood" },
          { label: "CEP", value: company.address.zipCode, field: "zipCode" },
        ].map((item) => (
          <div key={item.field}>
            <label className="text-sm text-text-secondary">{item.label}</label>
            <input
              disabled={!isEditing}
              value={item.value}
              onChange={(e) =>
                handleAddressChange(
                  item.field as keyof Company["address"],
                  e.target.value
                )
              }
              className={`mt-1 w-full border rounded px-3 py-2 ${
                !isEditing
                  ? "bg-offWhite cursor-not-allowed"
                  : "bg-principal-white focus:outline-none focus:ring-2 focus:ring-principal-blue"
              } transition`}
            />
          </div>
        ))}

        <div>
          <label className="text-sm text-text-secondary">Cidade</label>
          <select
            disabled={!isEditing}
            value={company.address.cityId ?? ""}
            onChange={(e) =>
              handleAddressChange("cityId", e.target.value)
            }
            className={`mt-1 w-full border rounded px-3 py-2 ${
              !isEditing
                ? "bg-offWhite cursor-not-allowed"
                : "bg-principal-white focus:outline-none focus:ring-2 focus:ring-principal-blue"
            } transition`}
          >
            <option value="">Selecione a cidade</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name} - {city.state}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}