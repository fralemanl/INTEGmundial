import React, {useState, useEffect} from "react";
import * as XLSX from "xlsx";
import {
  getMatches,
  createMatch,
  updateMatch,
  deleteMatch,
  getUsers,
  updateUser,
  resetUserPassword,
  deleteUser,
  resetAll,
  exportPredictions,
} from "../api";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import TeamFlag from "./TeamFlag";
dayjs.extend(utc);
dayjs.extend(timezone);

function AdminPanel() {
  // Suponiendo que el usuario admin está en localStorage (ajusta según tu auth real)
  const adminUserId = Number(localStorage.getItem("user_id"));
  const isAdmin = localStorage.getItem("is_admin") === "true";
  const [activeTab, setActiveTab] = useState("matches");
  // Users
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    username: "",
    email: "",
    is_admin: false,
  });

  // Matches
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [formData, setFormData] = useState({
    team_home: "",
    team_away: "",
    match_date: "",
    phase: "Grupo A",
    group: "",
    stadium: "",
    score_home: "",
    score_away: "",
    is_finished: false,
    winner: "",
  });
  // Filtros para la tabla de partidos
  const [phaseFilter, setPhaseFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const phases = [
    "Grupo A",
    "Grupo B",
    "Grupo C",
    "Grupo D",
    "Grupo E",
    "Grupo F",
    "Grupo G",
    "Grupo H",
    "Grupo I",
    "Grupo J",
    "Grupo K",
    "Grupo L",
    "Dieciseisavos",
    "Octavos de Final",
    "Cuartos de Final",
    "Semifinal",
    "Tercer Lugar",
    "Final",
  ];

  useEffect(() => {
    loadMatches();
    loadUsers();
  }, []);

  // Users logic
  const loadUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response?.data || []);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setUserLoading(false);
    }
  };
  const handleUserInputChange = (e) => {
    const {name, value, type, checked} = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
    });
  };
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      await deleteUser(userId);
      loadUsers();
    } catch (err) {
      alert("Error al eliminar el usuario");
    }
  };
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editingUser.id, userFormData);
      setEditingUser(null);
      setUserFormData({username: "", email: "", is_admin: false});
      loadUsers();
    } catch (err) {
      alert("Error al actualizar el usuario");
    }
  };
  const handleResetPassword = async () => {
    const newPassword = window.prompt("Nueva contraseña:");
    if (!newPassword) return;
    try {
      await resetUserPassword(editingUser.id, newPassword);
      alert("Contraseña actualizada");
    } catch (err) {
      alert("Error al reestablecer la contraseña");
    }
  };

  // Matches logic
  const loadMatches = async () => {
    try {
      const response = await getMatches();
      setMatches(response?.data || []);
    } catch (err) {
      console.error("Error loading matches:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const {name, value, type, checked} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const matchDateISO = dayjs
        .tz(formData.match_date, "America/Panama")
        .toISOString();
      if (editingMatch) {
        // Only send allowed fields for update
        const payload = {
          team_home: formData.team_home,
          team_away: formData.team_away,
          score_home:
            formData.score_home !== "" ? parseInt(formData.score_home) : null,
          score_away:
            formData.score_away !== "" ? parseInt(formData.score_away) : null,
          is_finished: formData.is_finished,
          winner: formData.winner !== undefined ? formData.winner : null,
          stadium: formData.stadium,
        };
        console.log("Update match payload:", payload);
        await updateMatch(editingMatch.id, payload);
      } else {
        // Limpiar payload para crear partido
        const payload = {
          team_home: formData.team_home,
          team_away: formData.team_away,
          match_date: matchDateISO,
          score_home:
            formData.score_home !== "" ? parseInt(formData.score_home) : null,
          score_away:
            formData.score_away !== "" ? parseInt(formData.score_away) : null,
          winner: formData.winner !== undefined ? formData.winner : null,
          is_finished: formData.is_finished,
          phase: formData.phase,
          stadium: formData.stadium || null,
        };
        await createMatch(payload);
      }
      resetForm();
      loadMatches();
    } catch (err) {
      alert("Error al guardar el partido");
    }
  };
  const handleEdit = (match) => {
    setEditingMatch(match);
    setFormData({
      ...match,
      match_date: new Date(match.match_date).toISOString().slice(0, 16),
      score_home: match.score_home || "",
      score_away: match.score_away || "",
      winner: match.winner || "",
    });
    setShowForm(true);
    window.scrollTo({top: 0, behavior: "smooth"});
  };
  const handleDelete = async (matchId) => {
    if (!window.confirm("¿Eliminar este partido?")) return;
    try {
      await deleteMatch(matchId);
      loadMatches();
    } catch (err) {
      alert("Error al eliminar el partido");
    }
  };
  const resetForm = () => {
    setFormData({
      team_home: "",
      team_away: "",
      match_date: "",
      phase: "Grupo A",
      group: "",
      stadium: "",
      score_home: "",
      score_away: "",
      is_finished: false,
      winner: "",
    });
    setEditingMatch(null);
    setShowForm(false);
  };
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) return <div className="text-center py-10">Cargando...</div>;

  const handleResetAll = async () => {
    if (
      !window.confirm(
        "¿Seguro que deseas resetear TODOS los partidos, predicciones y campeón? Esta acción no se puede deshacer.",
      )
    )
      return;
    try {
      await resetAll(adminUserId);
      alert("Todos los partidos, predicciones y campeón han sido reseteados.");
      loadMatches();
    } catch (err) {
      alert(
        "Error al resetear todo: " +
          (err?.response?.data?.detail || err.message),
      );
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          className={`px-6 py-2 rounded-lg font-bold text-white ${activeTab === "matches" ? "bg-green-600" : "bg-slate-700"}`}
          onClick={() => setActiveTab("matches")}
        >
          Partidos
        </button>
        <button
          className={`px-6 py-2 rounded-lg font-bold text-white ${activeTab === "users" ? "bg-green-600" : "bg-slate-700"}`}
          onClick={() => setActiveTab("users")}
        >
          Usuarios
        </button>
        <button
          className="px-6 py-2 rounded-lg font-bold text-white bg-blue-700 hover:bg-blue-600 ml-auto"
          onClick={async () => {
            const {data} = await exportPredictions();
            if (!data || data.length === 0) {
              alert("No hay predicciones para exportar.");
              return;
            }
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Predicciones");
            XLSX.writeFile(wb, "predicciones.xlsx");
          }}
        >
          ⬇ Exportar Excel
        </button>
      </div>

      {/* MATCHES TAB */}
      {activeTab === "matches" && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-black text-green-900 drop-shadow">
              Panel de Administración
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-green-800 to-green-900 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform"
              >
                {showForm ? "Cancelar" : "+ Nuevo Partido"}
              </button>
              {isAdmin && (
                <button
                  onClick={handleResetAll}
                  className="bg-gradient-to-r from-red-700 to-red-900 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform border border-red-900"
                  title="Resetear todos los partidos, predicciones y campeón"
                >
                  Resetear TODO
                </button>
              )}
            </div>
          </div>
          {showForm && (
            <div className="bg-slate-900 p-6 rounded-xl mb-8 border-2 border-green-900 shadow-xl">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="team_home"
                    placeholder="Equipo Local"
                    value={formData.team_home}
                    onChange={handleInputChange}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-green-900 focus:border-green-900 outline-none"
                  />
                  <input
                    type="text"
                    name="team_away"
                    placeholder="Equipo Visitante"
                    value={formData.team_away}
                    onChange={handleInputChange}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-green-900 focus:border-green-900 outline-none"
                  />
                  <input
                    type="datetime-local"
                    name="match_date"
                    value={formData.match_date}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-green-900 focus:border-green-900 outline-none"
                  />
                  <select
                    name="phase"
                    value={formData.phase}
                    onChange={handleInputChange}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-green-900 focus:border-green-900 outline-none"
                  >
                    {phases.map((phase) => (
                      <option key={phase} value={phase}>
                        {phase}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="stadium"
                    placeholder="Estadio"
                    value={formData.stadium}
                    onChange={handleInputChange}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-green-900 focus:border-green-900 outline-none"
                  />
                  <div className="flex flex-row gap-4 items-end mb-2">
                    <input
                      type="number"
                      name="score_home"
                      placeholder="Goles Local"
                      value={formData.score_home}
                      onChange={handleInputChange}
                      min="0"
                      className="bg-slate-800 text-white px-6 py-3 rounded-lg border border-green-900 focus:border-green-900 outline-none text-lg w-40"
                    />
                    <span className="text-white font-bold text-2xl">-</span>
                    <input
                      type="number"
                      name="score_away"
                      placeholder="Goles Visitante"
                      value={formData.score_away}
                      onChange={handleInputChange}
                      min="0"
                      className="bg-slate-800 text-white px-6 py-3 rounded-lg border border-green-900 focus:border-green-900 outline-none text-lg w-40"
                    />
                    <select
                      className="bg-slate-800 text-white px-6 py-3 rounded-lg border border-green-900 focus:border-green-900 outline-none text-lg w-56"
                      style={{backgroundColor: "#1e293b", color: "#fff"}}
                      value={formData.winner}
                      onChange={(e) =>
                        setFormData({...formData, winner: e.target.value})
                      }
                    >
                      <option value="" style={{color: "#000"}}>
                        Selecciona ganador
                      </option>
                      <option
                        value={formData.team_home}
                        style={{color: "#000"}}
                      >
                        {formData.team_home || "Local"}
                      </option>
                      <option
                        value={formData.team_away}
                        style={{color: "#000"}}
                      >
                        {formData.team_away || "Visitante"}
                      </option>
                      <option value="Empate" style={{color: "#000"}}>
                        Empate
                      </option>
                    </select>
                  </div>
                  <label className="flex items-center col-span-2 text-white">
                    <input
                      type="checkbox"
                      name="is_finished"
                      checked={formData.is_finished}
                      onChange={handleInputChange}
                      className="mr-2 accent-green-900"
                    />
                    Partido Finalizado
                  </label>
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-2 mt-6 rounded-lg font-bold shadow-lg hover:scale-105 transition-transform"
                >
                  {editingMatch ? "Actualizar" : "Crear"}
                </button>
              </form>
            </div>
          )}
          {/* Filtros por fase, grupo y equipo */}
          <div className="flex flex-wrap gap-2 mb-4">
            <select
              value={phaseFilter || ""}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="px-4 py-2 rounded-full text-sm font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"
            >
              <option value="">Todas las fases</option>
              {phases.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={groupFilter || ""}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-4 py-2 rounded-full text-sm font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"
            >
              <option value="">Todos los grupos</option>
              {[
                ...new Set(matches.filter((m) => m.group).map((m) => m.group)),
              ].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select
              value={teamFilter || ""}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="px-4 py-2 rounded-full text-sm font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"
            >
              <option value="">Todos los equipos</option>
              {[
                ...new Set(matches.flatMap((m) => [m.team_home, m.team_away])),
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-slate-900 rounded-xl shadow-xl border-2 border-green-700 overflow-hidden">
            <h2 className="text-xl font-bold p-6 border-b border-green-900 text-white">
              Partidos Creados ({matches.length})
            </h2>
            {matches.length === 0 ? (
              <div className="text-center text-white py-10">
                No hay partidos creados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-900 to-green-950">
                    <tr>
                      <th className="text-left py-3 px-4 text-green-300 font-bold text-sm">
                        Fecha
                      </th>
                      <th className="text-left py-3 px-4 text-green-300 font-bold text-sm">
                        Fase
                      </th>
                      <th className="text-left py-3 px-4 text-green-300 font-bold text-sm">
                        Partido
                      </th>
                      <th className="text-left py-3 px-4 text-green-300 font-bold text-sm">
                        Estadio
                      </th>
                      <th className="text-center py-3 px-4 text-green-300 font-bold text-sm">
                        Resultado
                      </th>
                      <th className="text-center py-3 px-4 text-green-300 font-bold text-sm">
                        Estado
                      </th>
                      <th className="text-center py-3 px-4 text-green-300 font-bold text-sm">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-800">
                    {matches
                      .filter(
                        (match) =>
                          (!phaseFilter || match.phase === phaseFilter) &&
                          (!groupFilter || match.group === groupFilter) &&
                          (!teamFilter ||
                            match.team_home === teamFilter ||
                            match.team_away === teamFilter),
                      )
                      .map((match) => (
                        <tr
                          key={match.id}
                          className="hover:bg-green-950/40 transition-colors"
                        >
                          <td className="py-3 px-4 text-white text-sm">
                            {formatDate(match.match_date)}
                          </td>
                          <td className="py-3 px-4 text-sm text-white font-medium">
                            {match.phase}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-white flex flex-col gap-1">
                              <TeamFlag team={match.team_home} size="20px" />
                              <TeamFlag team={match.team_away} size="20px" />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-white">
                            {match.stadium || "-"}
                          </td>
                          <td className="text-center py-3 px-4">
                            {match.is_finished ? (
                              <span className="font-bold text-white bg-green-950 px-2 py-1 rounded">
                                {match.score_home} - {match.score_away}
                              </span>
                            ) : (
                              <span className="text-white">-</span>
                            )}
                          </td>
                          <td className="text-center py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-sm ${match.is_finished ? "bg-green-900/20 text-white border border-green-900/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"}`}
                            >
                              {match.is_finished ? "Finalizado" : "Pendiente"}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <button
                              onClick={() => handleEdit(match)}
                              className="text-blue-400 hover:text-blue-300 font-bold text-sm mr-3"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(match.id)}
                              className="text-red-400 hover:text-red-300 font-bold text-sm"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <>
          <h2 className="text-xl font-bold mb-6 text-white">Usuarios</h2>
          {userLoading ? (
            <div className="text-center text-slate-500 py-10">
              Cargando usuarios...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">
                      Usuario
                    </th>
                    <th className="text-left py-3 px-4 text-slate-400 font-bold text-sm">
                      Email
                    </th>
                    <th className="text-center py-3 px-4 text-slate-400 font-bold text-sm">
                      Admin
                    </th>
                    <th className="text-center py-3 px-4 text-slate-400 font-bold text-sm">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-300 text-sm">
                        {user.username}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-400">
                        {user.email}
                      </td>
                      <td className="text-center py-3 px-4">
                        {user.is_admin ? "Sí" : "No"}
                      </td>
                      <td className="text-center py-3 px-4">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-400 hover:text-blue-300 font-bold text-sm mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-400 hover:text-red-300 font-bold text-sm"
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={handleResetPassword}
                          className="text-yellow-400 hover:text-yellow-300 font-bold text-sm ml-3"
                        >
                          Reset Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {editingUser && (
            <div className="bg-slate-800 p-6 rounded-xl mb-8 mt-6">
              <form onSubmit={handleUserSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="username"
                    placeholder="Usuario"
                    value={userFormData.username}
                    onChange={handleUserInputChange}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={userFormData.email}
                    onChange={handleUserInputChange}
                  />
                  <label className="flex items-center col-span-2">
                    <input
                      type="checkbox"
                      name="is_admin"
                      checked={userFormData.is_admin}
                      onChange={handleUserInputChange}
                      className="mr-2"
                    />
                    Admin
                  </label>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 mt-6 rounded-lg"
                >
                  Actualizar Usuario
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminPanel;
