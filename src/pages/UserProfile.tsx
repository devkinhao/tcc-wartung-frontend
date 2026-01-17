import { useRef, useState } from "react";
import { Camera, Lock, Eye, EyeOff } from "lucide-react";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [showPasswords, setShowPasswords] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Mock user
  const user = {
    fullName: "João da Silva",
    cpf: "123.456.789-00",
    email: "joao.silva@email.com",
    creaNumber: "123456-D",
    avatar: null as string | null,
  };

  const [fullName, setFullName] = useState(user.fullName);
  const [cpf, setCpf] = useState(user.cpf);
  const [email, setEmail] = useState(user.email);
  const [creaNumber, setCreaNumber] = useState(user.creaNumber ?? "");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleSaveProfile() {
    console.log("Salvar perfil (mock)", {
      fullName,
      cpf,
      email,
      creaNumber,
      avatarFile,
    });
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setFullName(user.fullName);
    setCpf(user.cpf);
    setEmail(user.email);
    setCreaNumber(user.creaNumber ?? "");
    setAvatarPreview(user.avatar);
    setAvatarFile(null);
    setIsEditing(false);
  }

  function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return;
    }

    setPasswordError("");
    console.log("Alterar senha (mock)", {
      currentPassword,
      newPassword,
    });

    setPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="max-w-4xl bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Meu perfil</h2>

      {/* Avatar */}
      <div className="flex items-center gap-6 mb-8">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-medium">
                {fullName.charAt(0)}
              </span>
            )}
          </div>

          {isEditing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
              title="Alterar avatar"
            >
              <Camera size={16} />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div>
          <p className="font-medium text-gray-900">{fullName}</p>
          <p className="text-sm text-gray-600">{email}</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: "Nome completo",
            value: fullName,
            setter: setFullName,
          },
          {
            label: "CPF",
            value: cpf,
            setter: setCpf,
            placeholder: "000.000.000-00",
          },
          {
            label: "E-mail",
            value: email,
            setter: setEmail,
            placeholder: "usuario@email.com",
          },
          {
            label: "CREA",
            value: creaNumber,
            setter: setCreaNumber,
          },
        ].map((field) => (
          <div key={field.label}>
            <label className="text-sm text-gray-600">{field.label}</label>
            <input
              disabled={!isEditing}
              value={field.value}
              placeholder={field.placeholder}
              onChange={(e) => field.setter(e.target.value)}
              className={`mt-1 w-full border rounded px-3 py-2 ${
                !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={() => setPasswordModalOpen(true)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:underline"
        >
          <Lock size={16} />
          Alterar senha
        </button>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gray-800 text-white px-5 py-2 rounded hover:bg-gray-700"
          >
            Editar perfil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 border rounded text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveProfile}
              className="bg-gray-800 text-white px-4 py-2 rounded text-sm"
            >
              Salvar alterações
            </button>
          </div>
        )}
      </div>

      {/* Modal senha */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded shadow w-full max-w-sm p-6">
            <h3 className="text-lg font-medium mb-4">Alterar senha</h3>

            <div className="space-y-3">
              {[{
                placeholder: "Senha atual",
                value: currentPassword,
                setter: setCurrentPassword,
              }, {
                placeholder: "Nova senha",
                value: newPassword,
                setter: setNewPassword,
              }, {
                placeholder: "Confirmar nova senha",
                value: confirmPassword,
                setter: setConfirmPassword,
              }].map((field, i) => (
                <div key={i} className="relative">
                  <input
                    type={showPasswords ? "text" : "password"}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="w-full border rounded px-3 py-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-2.5 text-gray-500"
                  >
                    {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              ))}

              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="px-4 py-2 border rounded text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                className="bg-gray-800 text-white px-4 py-2 rounded text-sm"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}