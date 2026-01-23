import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const { token } = await login({ username, password });

      localStorage.setItem("token", token);

      navigate("/dashboard");
    } catch (err: any) {
      setError("Usuário ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* CARD LOGIN */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-principal-white">
        <div className="w-80 p-8 rounded-lg shadow-lg">
          {/* LOGO */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-principal-blue">
              Engenharia Maas
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuário"
              className="w-full p-3 border rounded"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full p-3 border rounded"
            />

            {error && (
              <span className="text-sm text-red-600">{error}</span>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded bg-principal-blue text-white disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>

      {/* LADO DIREITO */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-b from-principal-blue to-principal-green items-center justify-center">
        <div className="text-white text-center px-8">
          <h2 className="text-4xl font-bold mb-4">Bem-vindo!</h2>
          <p className="text-lg">
            Acesse seu painel e gerencie seus clientes e inspeções.
          </p>
        </div>
      </div>
    </div>
  );
}