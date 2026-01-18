// src/pages/Login.tsx
import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você colocaria a lógica de login
    console.log("Usuário:", username, "Senha:", password);
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* CARD LOGIN */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-principal-white">
        <div className="w-80 p-8 rounded-lg shadow-lg">
          {/* LOGO */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-principal-blue">Engenharia Maas</span>
          </div>

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuário"
              className="w-full p-3 border border-offWhite rounded text-text-default placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-principal-blue transition"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full p-3 border border-offWhite rounded text-text-default placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-principal-blue transition"
            />

            <button
              type="submit"
              className="w-full py-3 rounded bg-principal-blue text-principal-white font-medium hover:bg-principal-green transition"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>

      {/* LADO ILUSTRATIVO / GRADIENTE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-b from-principal-blue to-principal-green items-center justify-center">
        <div className="text-principal-white text-center px-8">
          <h2 className="text-4xl font-bold mb-4">Bem-vindo!</h2>
          <p className="text-lg">
            Acesse seu painel e gerencie seus clientes e inspeções com facilidade.
          </p>
        </div>
      </div>
    </div>
  );
}