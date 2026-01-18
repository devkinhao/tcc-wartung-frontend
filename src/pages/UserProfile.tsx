import { useRef, useState } from "react";
import { FiCamera, FiLock, FiEye, FiEyeOff } from "react-icons/fi"; // Feather Icons

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
    <div className="max-w-4xl bg-principal-white rounded shadow p-6 font-sans">
      <h2 className="text-xl font-semibold mb-6 text-principal-blue">Meu perfil</h2>

      {/* Avatar */}
      <div className="flex items-center gap-6 mb-8">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-offWhite overflow-hidden flex items-center justify-center text-text-secondary text-3xl font-medium">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{fullName.charAt(0)}</span>
            )}
          </div>

          {isEditing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-principal-blue text-principal-white p-2 rounded-full hover:bg-principal-green transition"
              title="Alterar avatar"
            >
              <FiCamera size={16} />
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
          <p className="font-medium text-text-default">{fullName}</p>
          <p className="text-sm text-text-secondary">{email}</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Nome completo", value: fullName, setter: setFullName },
          { label: "CPF", value: cpf, setter: setCpf, placeholder: "000.000.000-00" },
          { label: "E-mail", value: email, setter: setEmail, placeholder: "usuario@email.com" },
          { label: "CREA", value: creaNumber, setter: setCreaNumber },
        ].map((field) => (
          <div key={field.label}>
            <label className="text-sm text-text-secondary">{field.label}</label>
            <input
              disabled={!isEditing}
              value={field.value}
              placeholder={field.placeholder}
              onChange={(e) => field.setter(e.target.value)}
              className={`mt-1 w-full border rounded px-3 py-2 placeholder:text-text-secondary ${
                !isEditing
                  ? "bg-offWhite cursor-not-allowed"
                  : "bg-principal-white focus:outline-none focus:ring-2 focus:ring-principal-blue"
              } transition`}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={() => setPasswordModalOpen(true)}
          className="flex items-center gap-2 text-sm text-principal-blue hover:underline transition"
        >
          <FiLock size={16} />
          Alterar senha
        </button>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-principal-blue text-principal-white px-5 py-2 rounded hover:bg-principal-green transition"
          >
            Editar perfil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 border rounded text-sm text-text-default hover:bg-offWhite transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveProfile}
              className="bg-principal-blue text-principal-white px-4 py-2 rounded text-sm hover:bg-principal-green transition"
            >
              Salvar alterações
            </button>
          </div>
        )}
      </div>

      {/* Modal senha */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-principal-white rounded shadow w-full max-w-sm p-6">
            <h3 className="text-lg font-medium mb-4 text-principal-blue">Alterar senha</h3>

            <div className="space-y-3">
              {[
                { placeholder: "Senha atual", value: currentPassword, setter: setCurrentPassword },
                { placeholder: "Nova senha", value: newPassword, setter: setNewPassword },
                { placeholder: "Confirmar nova senha", value: confirmPassword, setter: setConfirmPassword },
              ].map((field, i) => (
                <div key={i} className="relative">
                  <input
                    type={showPasswords ? "text" : "password"}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="w-full border rounded px-3 py-2 pr-10 placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-principal-blue transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-2.5 text-text-secondary"
                  >
                    {showPasswords ? <FiEyeOff size={18} /> : <FiEye size={18} />}
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
                className="px-4 py-2 border rounded text-sm text-text-default hover:bg-offWhite transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                className="bg-principal-blue text-principal-white px-4 py-2 rounded text-sm hover:bg-principal-green transition"
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
