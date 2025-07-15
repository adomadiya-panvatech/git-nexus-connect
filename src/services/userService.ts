
import { api } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  role?: string;
}

export interface TrackingEntry {
  id: number;
  user_id: number;
  activity_id: number;
  value: number;
  date: string;
}

export const userService = {
  // Users
  getUsers: () => api.get<User[]>('/users'),
  getUser: (id: number) => api.get<User>(`/users/${id}`),
  
  // Tracking
  getTrackingEntries: () => api.get<TrackingEntry[]>('/tracking-entries'),
  
  // User habits
  getUserHabits: (userId: number) => api.get<any[]>(`/user-habits/user/${userId}`),
  
  // Auth
  login: (data: { email: string; password: string }) => api.post<{ token: string; user: User }>(
    '/auth/login',
    data
  ),
  register: (data: { email: string; password: string; firstName: string }) => api.post<{ token: string; user: User }>(
    '/auth/register',
    data
  ),
};
