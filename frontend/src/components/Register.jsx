import React, {useState} from "react";
import teams from "../utils/teams";
import {useNavigate} from "react-router-dom";
import {registerUser} from "../api";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    company: "",
    champion: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerUser(formData);
      alert("Registro exitoso. Ahora puedes iniciar sesión.");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Error en el registro. Inténtalo de nuevo.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-700 via-blue-600 to-purple-600">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-900/90 rounded-2xl shadow-2xl border border-slate-700">
        <h2 className="text-3xl font-extrabold text-center text-white drop-shadow mb-2">
          Crear una cuenta
        </h2>
        <p className="text-center text-slate-300 mb-4">
          ¡Únete a la quiniela y compite por el primer lugar!
        </p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* CAMPO PARA SELECCIONAR CAMPEÓN */}
          <div>
            <label
              htmlFor="champion"
              className="text-sm font-semibold text-slate-200"
            >
              ¿Quién será el campeón del Mundial?
            </label>
            <select
              id="champion"
              name="champion"
              value={formData.champion}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border border-yellow-500 bg-slate-800 text-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="" disabled>
                Selecciona un equipo...
              </option>
              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="username"
              className="text-sm font-semibold text-slate-200"
            >
              Nombre de usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border border-indigo-500 bg-slate-800 text-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-200"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border border-indigo-500 bg-slate-800 text-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 placeholder:text-slate-400"
            />
          </div>
          {/* ----- 2. AQUÍ ESTÁ EL NUEVO CAMPO PARA LA COMPAÑÍA ----- */}
          <div>
            <label
              htmlFor="company"
              className="text-sm font-semibold text-slate-200"
            >
              Nombre de la Compañía
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              placeholder="Opcional"
              className="w-full px-3 py-2 mt-1 border border-indigo-400 bg-slate-800 text-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-slate-400"
            />
          </div>
          {/* ------------------------------------------------------- */}
          <div>
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-200"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border border-indigo-500 bg-slate-800 text-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 placeholder:text-slate-400"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 font-semibold text-center">
              {error}
            </p>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-lg hover:from-indigo-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
