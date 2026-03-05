import React, {useState} from "react";
import {loginUser} from "../api";

function Login({onLogin}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({username, password});
      onLogin(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail === "Credenciales inválidas") {
        setError("Usuario y/o Password incorrecto");
      } else {
        setError(detail || "Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <h2 className="text-3xl font-black text-white mb-6 text-center">
          Iniciar Sesión
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-slate-400 text-sm font-bold mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-slate-400 text-sm font-bold mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/20 transition-all transform active:scale-95"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400 text-sm">
          ¿No tienes cuenta?{" "}
          <a
            href="/registro"
            className="text-green-400 hover:underline font-bold"
          >
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
