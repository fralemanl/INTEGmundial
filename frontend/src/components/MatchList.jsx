// ...existing code...
import React, {useState, useEffect} from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {formatPanama} from "../utils/panamaTime";
import {getMatches, getUserPredictions, createPrediction} from "../api";
import TeamFlag from "./TeamFlag";

function MatchList({user}) {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Filtro por fase
  const [phaseFilter, setPhaseFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [stadiumFilter, setStadiumFilter] = useState("");

  // Ya no bloquea la vista si no hay usuario

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadMatches();
      if (user && !user.is_admin) {
        await loadPredictions();
      } else {
        setPredictions({});
      }
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, [user]);

  const loadMatches = async () => {
    try {
      const matchesRes = await getMatches();
      setMatches(
        matchesRes && Array.isArray(matchesRes.data) ? matchesRes.data : [],
      );
    } catch (err) {
      setError("Error al cargar los partidos");
    }
  };

  const loadPredictions = async () => {
    if (!user) return;
    try {
      const predictionsRes = await getUserPredictions(user.id);
      const predMap = {};
      (predictionsRes && Array.isArray(predictionsRes.data)
        ? predictionsRes.data
        : []
      )
        .filter((pred) => pred && pred.match_id)
        .forEach((pred) => {
          predMap[pred.match_id] = {
            ...pred,
            predicted_home:
              pred.predicted_home !== undefined && pred.predicted_home !== null
                ? Number(pred.predicted_home)
                : "",
            predicted_away:
              pred.predicted_away !== undefined && pred.predicted_away !== null
                ? Number(pred.predicted_away)
                : "",
          };
        });
      setPredictions(predMap);
    } catch (err) {
      setPredictions({});
    }
  };
  // ...existing code...

  const handlePredictionChange = (matchId, team, value) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        match_id: matchId,
        [`predicted_${team}`]: value === "" ? "" : parseInt(value),
      },
    }));
  };

  // Para knockout: guardar ganador en penales si hay empate
  const handleWinnerChange = (matchId, winner) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        predicted_winner: winner,
      },
    }));
  };

  // Fases knockout con variantes y normalización
  const knockoutPhases = [
    "dieciseisavos",
    "octavos",
    "octavosdefinal",
    "octavos de final",
    "cuartos",
    "cuartosdefinal",
    "cuartos de final",
    "cuartosdefinales",
    "semifinal",
    "semifinales",
    "final",
    "tercerlugar",
    "tercer lugar",
    "tercerpuesto",
    "tercer puesto",
  ].map((p) =>
    p
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, "")
      .toLowerCase(),
  );

  // Normaliza la fase para comparar knockout
  function normalizePhase(phase) {
    if (!phase) return "";
    return phase
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, "")
      .toLowerCase();
  }
  const handleSubmitPrediction = async (matchId) => {
    if (user.is_admin) {
      setError("Los administradores no pueden jugar.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    const prediction = predictions[matchId];
    const match = matches.find((m) => m.id === matchId);
    const isKnockout =
      match && knockoutPhases.includes(normalizePhase(match.phase));
    const isDraw =
      prediction && prediction.predicted_home === prediction.predicted_away;
    if (
      !prediction ||
      prediction.predicted_home === "" ||
      prediction.predicted_home === null ||
      prediction.predicted_away === "" ||
      prediction.predicted_away === null
    ) {
      setError("Por favor ingresa ambos resultados");
      return;
    }
    // Calcular ganador para fase de grupos o knockout
    let winner = undefined;
    if (!isKnockout) {
      if (prediction.predicted_home > prediction.predicted_away) {
        winner = match.home_team;
      } else if (prediction.predicted_home < prediction.predicted_away) {
        winner = match.away_team;
      } else {
        winner = "Empate";
      }
    } else if (isKnockout && isDraw) {
      winner = prediction.predicted_winner;
    }
    try {
      await createPrediction(user.id, {
        match_id: matchId,
        predicted_home: prediction.predicted_home,
        predicted_away: prediction.predicted_away,
        winner: winner,
      });
      setSuccess("Predicción guardada correctamente");
      setTimeout(() => setSuccess(""), 3000);
      await loadPredictions();
      setPredictions((prev) => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          editing: false,
        },
      }));
    } catch (err) {
      setError(err.response?.data?.detail || "Error al guardar la predicción");
      setTimeout(() => setError(""), 3000);
    }
  };

  const formatDate = (dateStr) => {
    // Formato: 25 Feb 2026 19:00 (hora de Panamá)
    return formatPanama(dateStr, "DD MMM YYYY HH:mm") + " (hora de Panamá)";
  };

  const canPredict = (match) => {
    const matchDate = new Date(match.match_date);
    return !match.is_finished && new Date() < matchDate;
  };

  // Ocultar partidos ya comenzados
  const now = new Date();
  const filteredMatches = matches.filter((match) => {
    let ok = true;
    // Solo mostrar partidos que no han comenzado
    if (now >= new Date(match.match_date)) return false;
    if (phaseFilter) ok = ok && match.phase === phaseFilter;
    if (dateFilter)
      ok = ok && dayjs(match.match_date).format("YYYY-MM-DD") === dateFilter;
    if (stadiumFilter) ok = ok && match.stadium === stadiumFilter;
    return ok;
  });

  const phases = [
    ...new Set(matches.filter((m) => m && m.phase).map((m) => m.phase)),
  ];
  const dates = [
    ...new Set(matches.map((m) => dayjs(m.match_date).format("YYYY-MM-DD"))),
  ];
  const stadiums = [
    ...new Set(matches.filter((m) => m && m.stadium).map((m) => m.stadium)),
  ];

  if (user && user.is_admin) {
    return (
      <div className="text-center py-10 text-red-400 font-bold">
        Los administradores no pueden jugar ni hacer predicciones.
      </div>
    );
  }
  if (loading) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-black mb-8 text-white">Mis Predicciones</h1>

      {/* Selectores por fase, fecha y estadio */}
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={phaseFilter}
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
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 rounded-full text-sm font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"
        >
          <option value="">Todas las fechas</option>
          {dates.map((d) => (
            <option key={d} value={d}>
              {dayjs(d).locale("es").format("DD MMM YYYY")}
            </option>
          ))}
        </select>
        <select
          value={stadiumFilter}
          onChange={(e) => setStadiumFilter(e.target.value)}
          className="px-4 py-2 rounded-full text-sm font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"
        >
          <option value="">Todos los estadios</option>
          {stadiums.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-6 text-center font-bold">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-center">
          {error} (Advertencia: puedes intentar grabar predicción)
        </div>
      )}

      {/* Filtros eliminados, solo selectores */}

      {/* Lista de partidos */}
      <div className="grid gap-4">
        {filteredMatches.map((match) => {
          const userPrediction = predictions[match.id];
          const isPredictable = canPredict(match);

          return (
            <div
              key={match.id}
              className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 hover:border-slate-600 transition-all flex flex-col items-center"
            >
              <div className="flex justify-between items-center mb-2 w-full">
                <span className="text-xs font-bold uppercase tracking-wider text-green-500">
                  {match.phase}
                </span>
                <span className="text-xs font-medium text-slate-400 bg-slate-900/50 px-2 py-1 rounded">
                  {formatDate(match.match_date)}
                </span>
              </div>

              {/* Mostrar estadio siempre que exista */}
              {match.stadium && (
                <div className="flex gap-4 text-xs text-slate-500 mb-4 w-full">
                  <span>🏟️ {match.stadium}</span>
                </div>
              )}

              <div
                className="grid grid-cols-3 items-center justify-items-center text-center w-full"
                style={{minWidth: "350px"}}
              >
                {/* Team 1 */}
                <div className="flex items-center justify-center w-full">
                  <TeamFlag team={match.team_home} size={60} showName={false} />
                  <span className="ml-2 font-bold text-2xl md:text-3xl">
                    {match.team_home}
                  </span>
                </div>

                {/* Prediction/Result block */}
                <div className="flex flex-col items-center justify-center w-full">
                  {/* Mostrar siempre la predicción del ganador arriba, para cualquier resultado */}
                  {user && userPrediction && !userPrediction.editing && (
                    <div className="mb-2 text-green-300 font-bold text-center">
                      Predicción:&nbsp;
                      {(() => {
                        // Si el backend ya calculó el ganador, mostrarlo siempre
                        if (userPrediction.winner) {
                          return userPrediction.winner;
                        }
                        // Si knockout y empate, usar predicted_winner
                        const isKnockout = knockoutPhases.includes(
                          normalizePhase(match.phase),
                        );
                        if (
                          userPrediction.predicted_home === undefined ||
                          userPrediction.predicted_away === undefined
                        ) {
                          return "-";
                        }
                        if (
                          isKnockout &&
                          userPrediction.predicted_home ===
                            userPrediction.predicted_away
                        ) {
                          return userPrediction.predicted_winner || "-";
                        }
                        if (
                          userPrediction.predicted_home >
                          userPrediction.predicted_away
                        ) {
                          return match.team_home;
                        }
                        if (
                          userPrediction.predicted_home <
                          userPrediction.predicted_away
                        ) {
                          return match.team_away;
                        }
                        if (
                          userPrediction.predicted_home ===
                          userPrediction.predicted_away
                        ) {
                          return "Empate";
                        }
                        return "-";
                      })()}
                    </div>
                  )}
                  {match.is_finished ? (
                    <div>
                      <div className="text-3xl md:text-4xl font-black text-white bg-slate-900/50 inline-block px-6 py-2 rounded-lg tracking-widest border border-slate-700">
                        {match.score_home} - {match.score_away}
                      </div>
                      {/* Mostrar ganador real en knockout si hay empate */}
                      {knockoutPhases.includes(normalizePhase(match.phase)) &&
                        match.score_home === match.score_away &&
                        match.winner && (
                          <div className="text-sm text-yellow-400 mt-1 font-bold">
                            Ganador: {match.winner}
                          </div>
                        )}
                      {match.winner === "Empate" && (
                        <div className="text-xs text-yellow-400 mt-1 font-bold">
                          Ganador: Empate
                        </div>
                      )}
                      {userPrediction && (
                        <div className="text-sm text-slate-400 mt-2 font-medium text-center">
                          Tu predicción: {userPrediction.predicted_home} -{" "}
                          {userPrediction.predicted_away}
                          <span
                            className={`ml-2 font-bold ${userPrediction.points > 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            ({userPrediction.points} pts)
                          </span>
                        </div>
                      )}
                    </div>
                  ) : isPredictable ? (
                    <div className="flex flex-col gap-2 items-center bg-slate-900/30 p-3 rounded-xl border border-slate-700/50">
                      {new Date() >= new Date(match.match_date) && (
                        <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 px-4 py-2 rounded-lg mb-2 text-center font-bold">
                          Partido comenzado
                        </div>
                      )}
                      <div className="flex gap-3 justify-center items-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={
                            userPrediction?.predicted_home !== undefined &&
                            userPrediction?.predicted_home !== null
                              ? userPrediction?.predicted_home
                              : ""
                          }
                          onChange={(e) =>
                            handlePredictionChange(
                              match.id,
                              "home",
                              e.target.value,
                            )
                          }
                          className="w-16 h-12 text-center text-xl font-bold bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                          placeholder="-"
                          disabled={
                            new Date() >= new Date(match.match_date) ||
                            (userPrediction &&
                              userPrediction.id &&
                              !userPrediction.editing)
                          }
                        />
                        <span className="text-2xl font-bold text-slate-500">
                          -
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={
                            userPrediction?.predicted_away !== undefined &&
                            userPrediction?.predicted_away !== null
                              ? userPrediction?.predicted_away
                              : ""
                          }
                          onChange={(e) =>
                            handlePredictionChange(
                              match.id,
                              "away",
                              e.target.value,
                            )
                          }
                          className="w-16 h-12 text-center text-xl font-bold bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                          placeholder="-"
                          disabled={
                            new Date() >= new Date(match.match_date) ||
                            (userPrediction &&
                              userPrediction.id &&
                              !userPrediction.editing)
                          }
                        />
                      </div>
                      {/* Ganador en penales para knockout y empate */}
                      {knockoutPhases.includes(normalizePhase(match.phase)) &&
                      userPrediction?.predicted_home !== undefined &&
                      userPrediction?.predicted_away !== undefined &&
                      userPrediction?.predicted_home !== "" &&
                      userPrediction?.predicted_away !== "" &&
                      userPrediction?.predicted_home ===
                        userPrediction?.predicted_away ? (
                        <div className="mt-2 flex flex-col items-center">
                          <label className="text-slate-400 text-sm mb-1">
                            ¿Quién gana en penales?
                          </label>
                          <select
                            value={userPrediction?.predicted_winner || ""}
                            onChange={(e) =>
                              handleWinnerChange(match.id, e.target.value)
                            }
                            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
                          >
                            <option value="">-- Selecciona --</option>
                            <option value={match.team_home}>
                              {match.team_home}
                            </option>
                            <option value={match.team_away}>
                              {match.team_away}
                            </option>
                          </select>
                          {userPrediction?.predicted_winner && (
                            <div className="mt-2 text-yellow-400 font-bold">
                              Ganador: {userPrediction.predicted_winner}
                            </div>
                          )}
                        </div>
                      ) : null}
                      {userPrediction && userPrediction.id ? (
                        <>
                          {!userPrediction.editing ? (
                            <button
                              onClick={() =>
                                setPredictions((prev) => ({
                                  ...prev,
                                  [match.id]: {
                                    ...prev[match.id],
                                    editing: true,
                                  },
                                }))
                              }
                              className="bg-yellow-500 hover:bg-yellow-400 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-yellow-900/20 transition-all active:scale-95 mt-2"
                              disabled={
                                new Date() >= new Date(match.match_date)
                              }
                            >
                              Modificar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSubmitPrediction(match.id)}
                              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all active:scale-95 mt-2"
                              disabled={
                                new Date() >= new Date(match.match_date)
                              }
                            >
                              Guardar
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handleSubmitPrediction(match.id)}
                          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all active:scale-95 mt-2"
                          disabled={new Date() >= new Date(match.match_date)}
                        >
                          Guardar
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic">
                      {userPrediction ? (
                        <div className="bg-slate-900/50 px-4 py-2 rounded-lg inline-block border border-slate-700">
                          <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                            Tu Predicción
                          </span>
                          <span className="text-xl font-bold text-white">
                            {userPrediction.predicted_home} -{" "}
                            {userPrediction.predicted_away}
                          </span>
                        </div>
                      ) : (
                        "No se pueden hacer predicciones"
                      )}
                    </div>
                  )}
                </div>

                {/* Team 2 */}
                <div className="flex items-center justify-center w-full">
                  <span className="mr-2 font-bold text-2xl md:text-3xl">
                    {match.team_away}
                  </span>
                  <TeamFlag team={match.team_away} size={60} showName={false} />
                </div>
              </div>
            </div>
          );
        })}

        {filteredMatches.length === 0 && (
          <div className="text-center text-slate-500 py-16 bg-slate-800 rounded-xl border border-slate-700 border-dashed">
            No hay partidos para mostrar
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchList;
