import React, {useState, useEffect} from "react";
import {getMatches, getUserPredictions, getChampionPrediction} from "../api";
import TeamFlag from "./TeamFlag";
import {formatPanama} from "../utils/panamaTime";

function Predictions({user}) {
  // const isAdmin = localStorage.getItem("is_admin") === "true";
  // const adminUserId = Number(localStorage.getItem("user_id"));
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [champion, setChampion] = useState(null);
  const [finalWinner, setFinalWinner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [matchesRes, predictionsRes, championRes] = await Promise.all([
        getMatches(),
        getUserPredictions(user.id),
        getChampionPrediction(user.id).catch(() => null),
      ]);

      setMatches(
        matchesRes && Array.isArray(matchesRes.data) ? matchesRes.data : [],
      );
      setPredictions(
        predictionsRes && Array.isArray(predictionsRes.data)
          ? predictionsRes.data
          : [],
      );
      setChampion(championRes && championRes.data ? championRes.data : null);

      // Buscar el ganador de la final si existe
      const finalMatch = matchesRes.data.find(
        (m) => m.phase === "Final" && m.is_finished && m.winner,
      );
      setFinalWinner(finalMatch ? finalMatch.winner : null);
      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setLoading(false);
    }
  };

  const getMatchById = (matchId) => {
    return matches.find((m) => m.id === matchId);
  };

  // Puntajes por fase
  const phasePoints = {
    "Fase de Grupos": {exacto: 5, ganador: 3, parcial: 1},
    Dieciseisavos: {exacto: 6, ganador: 3},
    Octavos: {exacto: 7, ganador: 4},
    Cuartos: {exacto: 9, ganador: 5},
    Semifinal: {exacto: 12, ganador: 6},
    Final: {exacto: 15, ganador: 8},
  };

  let exactos = 0,
    ganador = 0,
    parcial = 0,
    totalPoints = 0;

  predictions.forEach((pred) => {
    const match = getMatchById(pred.match_id);
    if (!match) return;
    const phase = match.phase || "Fase de Grupos";
    const pts = pred.points || 0;
    totalPoints += pts;
    if (pts === phasePoints[phase]?.exacto) exactos++;
    else if (pts === phasePoints[phase]?.ganador) ganador++;
    else if (phase === "Fase de Grupos" && pts === phasePoints[phase]?.parcial)
      parcial++;
  });
  // Sumar 15 puntos si acertó el campeón
  if (champion && finalWinner && champion.team === finalWinner) {
    totalPoints += 15;
  }

  const formatDate = (dateStr) => {
    return formatPanama(dateStr, "DD MMM HH:mm");
  };

  if (loading) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  // Ordenar predicciones por fecha de partido (de antes a después)
  const sortedPredictions = [...predictions].sort((a, b) => {
    const matchA = getMatchById(a.match_id);
    const matchB = getMatchById(b.match_id);
    if (!matchA || !matchB) return 0;
    return new Date(matchA.match_date) - new Date(matchB.match_date);
  });

  return (
    <div>
      <h1 className="text-3xl font-black mb-8 text-white">Mis puntos</h1>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="text-4xl font-black text-green-400 mb-1">
            {totalPoints}
          </div>
          <div className="text-slate-400 font-medium uppercase text-sm tracking-wider">
            Puntos Totales
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="text-4xl font-black text-blue-400 mb-1">
            {exactos}
          </div>
          <div className="text-slate-400 font-medium uppercase text-sm tracking-wider">
            Resultados Exactos
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="text-4xl font-black text-yellow-400 mb-1">
            {ganador}
          </div>
          <div className="text-slate-400 font-medium uppercase text-sm tracking-wider">
            Ganador/Tendencia
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="text-4xl font-black text-pink-400 mb-1">
            {parcial}
          </div>
          <div className="text-slate-400 font-medium uppercase text-sm tracking-wider">
            Parcial (Fase Grupos)
          </div>
        </div>
      </div>
      {champion && (
        <div className="mb-8 bg-slate-900/70 p-4 rounded-xl border border-yellow-700 flex items-center gap-4">
          <span className="text-2xl">👑</span>
          <span className="text-white font-bold">
            Tu campeón: <span className="text-yellow-300">{champion.team}</span>
            {finalWinner &&
              (champion.team === finalWinner ? (
                <span className="ml-2 text-green-400 font-black">
                  +15 pts (¡Acertaste!)
                </span>
              ) : (
                <span className="ml-2 text-red-400 font-black">
                  No acertaste
                </span>
              ))}
            {!finalWinner && (
              <span className="ml-2 text-slate-400">(15 pts si aciertas)</span>
            )}
          </span>
        </div>
      )}

      {/* Lista de predicciones */}
      <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden">
        <h2 className="text-xl font-bold p-6 border-b border-slate-700 text-white">
          Historial de Predicciones
        </h2>

        {predictions.length === 0 ? (
          <div className="text-center text-slate-500 py-10">
            Aún no has hecho ninguna predicción
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left py-4 px-6 text-slate-400 font-bold text-sm uppercase">
                    Fecha
                  </th>
                  <th className="text-left py-4 px-6 text-slate-400 font-bold text-sm uppercase">
                    Partido
                  </th>
                  <th className="text-center py-4 px-6 text-slate-400 font-bold text-sm uppercase">
                    Tu Predicción
                  </th>
                  <th className="text-center py-4 px-6 text-slate-400 font-bold text-sm uppercase">
                    Ganador
                  </th>
                  <th className="text-center py-4 px-6 text-slate-400 font-bold text-sm uppercase">
                    Resultado
                  </th>
                  <th className="text-center py-4 px-6 text-slate-400 font-bold text-sm uppercase">
                    Puntos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {/* Predicción de campeón como fila especial */}
                {champion && (
                  <tr className="bg-yellow-900/30 border-b-2 border-yellow-600">
                    <td className="py-4 px-6 text-slate-300 font-bold">-</td>
                    <td className="py-4 px-6 font-bold text-yellow-300 flex items-center gap-2">
                      <span className="text-2xl">👑</span> Campeón del Mundial
                    </td>
                    <td className="text-center py-4 px-6 font-bold text-yellow-200">
                      {champion.team}
                    </td>
                    <td className="text-center py-4 px-6 font-bold text-yellow-200">
                      -
                    </td>
                    <td className="text-center py-4 px-6 font-bold text-yellow-200">
                      -
                    </td>
                    <td className="text-center py-4 px-6 font-bold">
                      {finalWinner ? (
                        champion.team === finalWinner ? (
                          <span className="text-green-400">+15 pts</span>
                        ) : (
                          <span className="text-red-400">0 pts</span>
                        )
                      ) : (
                        <span className="text-slate-400">
                          (15 pts si aciertas)
                        </span>
                      )}
                    </td>
                  </tr>
                )}
                {sortedPredictions.map((prediction) => {
                  const match = getMatchById(prediction.match_id);
                  if (!match) return null;

                  return (
                    <tr
                      key={prediction.id}
                      className="hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="py-4 px-6 text-slate-300">
                        {formatDate(match.match_date)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-white flex flex-col gap-1">
                          <TeamFlag team={match.team_home} size="20px" />
                          <TeamFlag team={match.team_away} size="20px" />
                        </div>
                        <div className="text-xs text-slate-500 uppercase font-bold mt-1">
                          {match.phase}
                        </div>
                      </td>
                      <td className="text-center py-4 px-6">
                        <span className="font-bold text-slate-300 bg-slate-900/50 px-3 py-1 rounded border border-slate-700">
                          {prediction.predicted_home} -{" "}
                          {prediction.predicted_away}
                        </span>
                      </td>
                      <td className="text-center py-4 px-6">
                        <span className="font-bold text-slate-300 bg-slate-900/50 px-3 py-1 rounded border border-slate-700">
                          {prediction.winner || "-"}
                        </span>
                      </td>
                      <td className="text-center py-4 px-6">
                        {match.is_finished ? (
                          <span className="font-bold text-white">
                            {match.score_home} - {match.score_away}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-sm">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="text-center py-4 px-6">
                        {match.is_finished ? (
                          <span
                            className={`font-bold ${
                              prediction.points === 3
                                ? "text-green-400"
                                : prediction.points === 1
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }`}
                          >
                            {prediction.points} pts
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Predictions;
