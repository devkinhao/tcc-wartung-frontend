// src/pages/Login.tsx
export default function Login() {
  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-80">
          <h1 className="text-3xl font-bold mb-6">SuaLogo<span className="text-yellow-500">#</span></h1>
          <input className="w-full mb-3 p-2 border rounded" placeholder="Usuário" />
          <input type="password" className="w-full mb-4 p-2 border rounded" placeholder="Senha" />
          <button className="w-full bg-gray-800 text-white py-2 rounded">Entrar</button>
        </div>
      </div>
      <div className="w-1/2 bg-gray-100" />
    </div>
  );
}