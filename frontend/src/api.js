import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Automatically attach Bearer token if logged in
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Fitness Tracking endpoints
export const fetchFitnessData = async () => (await api.get('/fitness')).data;
export const saveFitnessData = async (data) => (await api.post('/fitness', data)).data;

// Authentication endpoints
export const login = async (data) => (await api.post('/auth/login', data)).data;
export const register = async (data) => (await api.post('/auth/register', data)).data;
export const googleLogin = async (data) => (await api.post('/auth/google', data)).data;
export const updateProfile = async (data) => (await api.put('/auth/profile', data)).data;

// Workout endpoints
export const fetchWorkouts = async () => (await api.get('/workouts')).data;
export const saveWorkout = async (data) => (await api.post('/workouts', data)).data;

// Food log endpoints
export const fetchFoodLogs = async (date) => (await api.get('/food', { params: date ? { date } : {} })).data;
export const saveFoodLog = async (data) => (await api.post('/food', data)).data;
export const deleteFoodLog = async (id) => (await api.delete(`/food/${id}`)).data;

// Weight log endpoints
export const fetchWeightLogs = async () => (await api.get('/weight')).data;
export const saveWeightLog = async (data) => (await api.post('/weight', data)).data;
export const deleteWeightLog = async (id) => (await api.delete(`/weight/${id}`)).data;

// Cardio log endpoints
export const fetchCardioLogs = async (date) => (await api.get('/cardio', { params: date ? { date } : {} })).data;
export const saveCardioLog = async (data) => (await api.post('/cardio', data)).data;
export const deleteCardioLog = async (id) => (await api.delete(`/cardio/${id}`)).data;
