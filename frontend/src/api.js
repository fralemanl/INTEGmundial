// Reset all (admin)
export const resetAll = (adminUserId) =>
  api.post(`/reset_all?admin_user_id=${adminUserId}`);
// Champion Prediction
export const getChampionPrediction = (userId) => api.get(`/champion/${userId}`);
import axios from "axios";

const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const API_BASE_URL = `${BASE}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Users
export const registerUser = (userData) => api.post("/users/register", userData);
export const loginUser = (credentials) => api.post("/users/login", credentials);
export const getUsers = () => api.get("/users");
export const updateUser = (userId, userData) =>
  api.put(`/users/${userId}`, userData);
export const deleteUser = (userId) => api.delete(`/users/${userId}`);
export const resetUserPassword = (userId, password) =>
  api.post(`/users/${userId}/reset_password`, {password});

// Matches
export const getMatches = () => api.get("/matches");
export const getMatch = (id) => api.get(`/matches/${id}`);
export const createMatch = (matchData) => api.post("/matches", matchData);
export const updateMatch = (id, matchData) =>
  api.put(`/matches/${id}`, matchData);
export const deleteMatch = (id) => api.delete(`/matches/${id}`);

// Predictions
export const createPrediction = (userId, predictionData) =>
  api.post(`/predictions?user_id=${userId}`, predictionData);
export const getUserPredictions = (userId) =>
  api.get(`/predictions/user/${userId}`);
export const getMatchPredictions = (matchId) =>
  api.get(`/predictions/match/${matchId}`);

// Leaderboard
export const getLeaderboard = () => api.get("/leaderboard");

export default api;
