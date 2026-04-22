import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config/api.config';

// ─── Helpers ─────────────────────────────────────────────────────

const getToken = (): Promise<string | null> => AsyncStorage.getItem('token');

const authHeaders = async () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${await getToken()}`,
});

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res  = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
  return data as T;
}

// ─── Tipos ───────────────────────────────────────────────────────

export type User = {
  _id:     string;
  name:    string;
  email:   string;
  peso:    number | null;
  altura:  number | null;
  edad:    number | null;
  goal:    'perdida_peso' | 'ganar_musculo' | 'resistencia';
  avatar:  string;
  bio:     string;
};

export type TodayStats = {
  calorias:       number;
  pasos:          number;
  minutosActivos: number;
  porcentaje:     number;
};

export type WeekDay = {
  fecha:    string;
  progress: number;
  calorias: number;
  pasos:    number;
  minutos:  number;
};

export type Recommendation = {
  title: string;
  type:  string;
  kcal:  string;
  emoji: string;
};

// ─── AUTH ────────────────────────────────────────────────────────

export const registerUser = async (payload: {
  name: string; email: string; password: string;
  peso?: number; altura?: number; edad?: number; goal?: string;
}): Promise<{ token: string; user: User }> => {
  const data = await apiFetch<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await AsyncStorage.setItem('token', data.token);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const loginUser = async (
  email: string, password: string
): Promise<{ token: string; user: User }> => {
  const data = await apiFetch<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  await AsyncStorage.setItem('token', data.token);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const logoutUser = async () => {
  await AsyncStorage.multiRemove(['token', 'user']);
};

export const getLocalUser = async (): Promise<User | null> => {
  const raw = await AsyncStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};

export const getProfile = async (): Promise<User> => {
  const data = await apiFetch<User>('/auth/profile', { headers: await authHeaders() });
  await AsyncStorage.setItem('user', JSON.stringify(data));
  return data;
};

export const updateProfile = async (
  updates: Partial<Pick<User, 'name' | 'peso' | 'altura' | 'edad' | 'goal' | 'bio' | 'avatar'>>
): Promise<User> => {
  const data = await apiFetch<User>('/auth/profile', {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(updates),
  });
  await AsyncStorage.setItem('user', JSON.stringify(data));
  return data;
};

export const deleteAccount = async (): Promise<void> => {
  await apiFetch<{ ok: boolean }>('/auth/profile', {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  await AsyncStorage.multiRemove(['token', 'user']);
};

// ─── STATS ───────────────────────────────────────────────────────

export const getTodayStats = async (): Promise<TodayStats> =>
  apiFetch('/stats/today', { headers: await authHeaders() });

export const getWeeklyStats = async (): Promise<WeekDay[]> =>
  apiFetch('/stats/weekly', { headers: await authHeaders() });

export const saveTodayProgress = async (data: Partial<TodayStats>): Promise<void> => {
  await apiFetch('/stats/today', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
};

// ─── RECOMENDACIONES ─────────────────────────────────────────────

export const getRecommendations = async (): Promise<Recommendation[]> =>
  apiFetch('/recommendations', { headers: await authHeaders() });

// ─── IA ──────────────────────────────────────────────────────────

export type ChatMsg = { role: 'user' | 'assistant'; content: string };

export const chatIA = async (
  message: string,
  history: ChatMsg[] = []
): Promise<{ reply: string }> => {
  const user = await getLocalUser();
  const res = await fetch('http://localhost:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, stream: false, name: user?.name ?? null, goal: user?.goal ?? null }),
  });
  if (!res.ok) throw new Error(`IA error ${res.status}`);
  return res.json();
};

// ─── RECETAS ─────────────────────────────────────────────────────

export type Receta = {
  _id:           string;
  titulo:        string;
  imagen:        string;
  calorias:      number;
  ingredientes:  string[];
  instrucciones: string;
  autorNombre:   string;
  categoria:     string;
  likes:         number;
  createdAt:     string;
};

export const getRecetas = async (): Promise<Receta[]> =>
  apiFetch('/recetas', { headers: await authHeaders() });

export const getMisRecetas = async (): Promise<Receta[]> =>
  apiFetch('/recetas/mias', { headers: await authHeaders() });

export const crearReceta = async (data: {
  titulo: string; imagen?: string; calorias: number;
  ingredientes: string[]; instrucciones?: string; categoria?: string;
}): Promise<Receta> =>
  apiFetch('/recetas', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

export const eliminarReceta = async (id: string): Promise<void> =>
  apiFetch(`/recetas/${id}`, { method: 'DELETE', headers: await authHeaders() });

// ─── ENTRENAMIENTOS ──────────────────────────────────────────────

export type Ejercicio = {
  nombre:   string;
  series:   number;
  reps:     string;
  descanso: string;
  notas:    string;
};

export type Entrenamiento = {
  _id:         string;
  titulo:      string;
  imagen:      string;
  descripcion: string;
  categoria:   string;
  duracion:    number;
  dificultad:  string;
  ejercicios:  Ejercicio[];
  autorNombre: string;
  likes:       number;
  createdAt:   string;
};

export const getEntrenamientos = async (): Promise<Entrenamiento[]> =>
  apiFetch('/entrenamientos', { headers: await authHeaders() });

export const getMisEntrenamientos = async (): Promise<Entrenamiento[]> =>
  apiFetch('/entrenamientos/mios', { headers: await authHeaders() });

export const crearEntrenamiento = async (data: Partial<Entrenamiento>): Promise<Entrenamiento> =>
  apiFetch('/entrenamientos', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

export const eliminarEntrenamiento = async (id: string): Promise<void> =>
  apiFetch(`/entrenamientos/${id}`, { method: 'DELETE', headers: await authHeaders() });
