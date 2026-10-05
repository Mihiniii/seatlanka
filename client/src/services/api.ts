import type { Seat, Trip, User } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const TOKEN_KEY = 'seatlanka_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, (data as { message?: string }).message ?? 'Request failed');
  }
  return data as T;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request<{ user: User }>('/auth/me'),

  searchTrips: (from: string, to: string, date: string) =>
    request<{ trips: Trip[] }>(
      `/trips?${new URLSearchParams({ from, to, date }).toString()}`,
    ),
  seatMap: (tripId: string) => request<{ trip: Trip; seats: Seat[] }>(`/trips/${tripId}/seats`),

  holdSeats: (tripId: string, seats: string[]) =>
    request<{ bookingIds: string[]; holdExpiresAt: string }>('/bookings/hold', {
      method: 'POST',
      body: JSON.stringify({ tripId, seats }),
    }),
  confirm: (bookingIds: string[]) =>
    request<{ ticketCode: string }>('/bookings/confirm', {
      method: 'POST',
      body: JSON.stringify({ bookingIds }),
    }),
};
