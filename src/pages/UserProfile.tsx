import { useRef, useState } from "react";
import { FiCamera, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiXCircle } from "react-icons/fi";

import {
  getMe,
  updateMe,
  changePassword,
  uploadAvatar,
  getAvatar,
} from "@/services/userService";

import { User } from "@/types/User";
import { canAccess } from "@/auth/permissions";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";

export default function UserProfile() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [showPasswords, setShowPasswords] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // ✅ buscar usuário
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["me"],
    queryFn: getMe,
  });

  // ✅ estados derivados (sem duplicar user)
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [creaNumber, setCreaNumber] = useState("");

  // sincroniza quando user chega
  React.useEffect(() => {
    if (!user) return;

    setFullName(user.fullName);
    setCpf(user.cpf);
    setEmail(user.email);
    setCreaNumber(user.creaNumber ?? "");

    if (user.id) {
      getAvatar(user.id)
        .then(setAvatarPreview)
        .catch(() => {});
    }
  }, [user]);

  // ✅ mutations
  const updateMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setIsEditing(false);
    },
  });

  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,

    async onMutate(file) {
      await queryClient.cancelQueries({ queryKey: ["me"] });

      const previousUser = queryClient.getQueryData<User>(["me"]);

      if (previousUser) {
        const previewUrl = URL.createObjectURL(file);

        queryClient.setQueryData<User>(["me"], {
          ...previousUser,
          avatarUrl: previewUrl,
        });
      }

      return { previousUser };
    },

    onError(_, __, context) {
      if (context?.previousUser) {
        queryClient.setQueryData(["me"], context.previousUser);
      }
    },

    onSettled() {
      queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    },
    onError: (err: any) => {
      setPasswordError(
        err?.response?.data?.message ?? "Erro ao alterar senha"
      );
    },
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSaveProfile() {
    updateMutation.mutate({
      fullName,
      cpf,
      email,
      creaNumber,
    });

    if (avatarFile) {
      avatarMutation.mutate(avatarFile);
    }
  }

  function handleCancelEdit() {
    if (!user) return;

    setFullName(user.fullName);
    setCpf(user.cpf);
    setEmail(user.email);
    setCreaNumber(user.creaNumber ?? "");
    setAvatarFile(null);
    setIsEditing(false);
  }

  function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return;
    }

    passwordMutation.mutate({
      currentPassword,
      newPassword,
    });
  }

  if (isLoading) {
    return <div className="p-6">Carregando perfil...</div>;
  }

  const isActive = user?.isActive ?? true; 
  const permissions = user?.permissions ?? [];

  const canChangePassword = canAccess(
    permissions,
    ["ROLE_CHANGE_OWN_PASSWORD"]
  );

  return (
    <div className="max-w-4xl bg-principal-white border border-offWhite rounded shadow p-6 font-sans">
      <h2 className="text-xl font-semibold mb-6 text-text">
        Meu perfil
      </h2>

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
              <span>{fullName?.charAt(0)}</span>
            )}
          </div>

          {isEditing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="
                absolute bottom-0 right-0
                bg-principal-blue text-white
                p-2 rounded-full
                hover:bg-principal-green
                transition
              "
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

        {/* STATUS */}
        <div>
          <p className="font-medium text-text text-lg">
            {fullName}
          </p>

          <div className="flex items-center gap-2 mt-1">
            {isActive ? (
              <>
                <FiCheckCircle className="text-success" />
                <span className="text-sm text-success font-medium">
                  Ativo
                </span>
              </>
            ) : (
              <>
                <FiXCircle className="text-danger" />
                <span className="text-sm text-danger font-medium">
                  Inativo
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Nome completo", value: fullName, setter: setFullName },
          { label: "CPF", value: cpf, setter: setCpf },
          { label: "E-mail", value: email, setter: setEmail },
          { label: "CREA", value: creaNumber, setter: setCreaNumber },
        ].map((field) => (
          <div key={field.label}>
            <label className="text-sm text-text-secondary">
              {field.label}
            </label>

            <input
              disabled={!isEditing}
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              className={`
                mt-1 w-full border border-offWhite
                rounded px-3 py-2
                bg-principal-white
                text-text
                placeholder:text-text-secondary
                ${
                  !isEditing
                    ? "bg-offWhite cursor-not-allowed opacity-70"
                    : "focus:outline-none focus:ring-2 focus:ring-principal-blue"
                }
              `}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between items-center">
        {canChangePassword && (
          <button
            onClick={() => setPasswordModalOpen(true)}
            className="flex items-center gap-2 text-sm text-principal-blue hover:underline"
          >
            <FiLock size={16} />
            Alterar senha
          </button>
        )}

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-principal-blue text-white px-5 py-2 rounded hover:bg-principal-green transition"
          >
            Editar perfil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancelEdit}
              className="
                px-4 py-2
                border border-offWhite
                rounded text-sm
                text-text
                hover:bg-offWhite
                transition
              "
            >
              Cancelar
            </button>

            <button
              onClick={handleSaveProfile}
              className="bg-principal-blue text-white px-4 py-2 rounded text-sm hover:bg-principal-green transition"
            >
              Salvar alterações
            </button>
          </div>
        )}
      </div>

      {/* Modal senha */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-principal-white border border-offWhite rounded shadow w-full max-w-sm p-6">
            <h3 className="text-lg font-medium mb-4 text-text">
              Alterar senha
            </h3>

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
                    className="
                      w-full border border-offWhite
                      rounded px-3 py-2 pr-10
                      bg-principal-white
                      text-text
                      focus:outline-none focus:ring-2 focus:ring-principal-blue
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-2.5 text-text-secondary"
                  >
                    {showPasswords ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              ))}

              {passwordError && (
                <p className="text-sm text-danger">{passwordError}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="px-4 py-2 border border-offWhite rounded text-sm text-text hover:bg-offWhite transition"
              >
                Cancelar
              </button>

              <button
                onClick={handleChangePassword}
                className="bg-principal-blue text-white px-4 py-2 rounded text-sm hover:bg-principal-green transition"
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