import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'admin' | 'instructor' | 'user';
}

interface AuthState {
  user: User | null;
  role: 'admin' | 'instructor' | 'user' | null;
  setUser: (user: User) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isInstructor: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      setUser: (user) => set({ user, role: user.role }),
      logout: () => set({ user: null, role: null }),
      isAdmin: () => get().role === 'admin',
      isInstructor: () => get().role === 'instructor' || get().role === 'admin',
    }),
    {
      name: 'auth-storage',
    }
  )
);
