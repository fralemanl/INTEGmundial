import React, {useState, useEffect} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import MatchList from "./components/MatchList";
import Predictions from "./components/Predictions";
import Leaderboard from "./components/Leaderboard";
import AdminPanel from "./components/AdminPanel";
import Welcome from "./components/Welcome";
import Mundial from "./pages/Mundial";

function App() {
  const [user, setUser] = useState(null);
  // Validación estricta de usuario
  const isValidUser = user && user.id && user.username && user.email;

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id && parsed.username && parsed.email) {
          setUser(parsed);
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch {
        setUser(null);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    window.location.href = "/bienvenida";
    localStorage.setItem("user", JSON.stringify(userData));
    // Guardar también is_admin y user_id para compatibilidad con AdminPanel
    localStorage.setItem("is_admin", userData.is_admin ? "true" : "false");
    localStorage.setItem("user_id", String(userData.id));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("is_admin");
    localStorage.removeItem("user_id");
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
        {/* Navbar */}
        <nav className="bg-slate-800 border-b border-slate-700 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link
                to="/"
                className="flex items-center gap-3 text-2xl font-black text-white tracking-tight hover:text-green-400 transition-colors"
              >
                <img
                  src="/img/integ.png"
                  alt="Logo Integ"
                  className="w-20 h-20 object-contain bg-white rounded shadow"
                  style={{marginBottom: 0}}
                />
                Quiniela <span className="text-green-500">Mundial</span>
              </Link>

              {isValidUser ? (
                <div className="flex items-center gap-4">
                  <Link
                    to="/bienvenida"
                    className="font-medium hover:text-green-400 transition-colors"
                  >
                    Bienvenido
                  </Link>
                  <Link
                    to="/partidos"
                    className="font-medium hover:text-green-400 transition-colors"
                  >
                    Mis Predicciones
                  </Link>
                  <Link
                    to="/predicciones"
                    className="font-medium hover:text-green-400 transition-colors"
                  >
                    Mis puntos
                  </Link>
                  <Link
                    to="/clasificacion"
                    className="font-medium hover:text-green-400 transition-colors"
                  >
                    Clasificación
                  </Link>
                  <Link
                    to="/mundial"
                    className="font-medium hover:text-green-400 transition-colors"
                  >
                    El Mundial
                  </Link>
                  {user.is_admin && (
                    <Link
                      to="/admin"
                      className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <span className="bg-slate-700 px-3 py-1 rounded-full text-sm font-bold border border-slate-600">
                    {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex gap-4">
                  <Link
                    to="/login"
                    className="font-medium hover:text-green-400 transition-colors py-2"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/registro"
                    className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all transform active:scale-95"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={
                isValidUser ? (
                  <Navigate to="/bienvenida" />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/login"
              element={
                isValidUser ? (
                  <Navigate to="/bienvenida" />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/bienvenida"
              element={
                isValidUser ? <Welcome user={user} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/registro"
              element={
                isValidUser ? (
                  <Navigate to="/partidos" />
                ) : (
                  <Register onRegister={handleLogin} />
                )
              }
            />
            <Route
              path="/partidos"
              element={
                isValidUser ? (
                  <MatchList user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/predicciones"
              element={
                isValidUser ? (
                  <Predictions user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/clasificacion"
              element={isValidUser ? <Leaderboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin"
              element={
                isValidUser && user.is_admin ? (
                  <AdminPanel />
                ) : (
                  <Navigate to="/partidos" />
                )
              }
            />
            <Route
              path="/mundial"
              element={
                isValidUser ? <Mundial /> : <Navigate to="/login" />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
