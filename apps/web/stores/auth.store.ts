import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Subscription {
  id: number | null;
  planId: number | null;
  status: 'active' | 'expired' | 'cancelled' | 'trial' | null;
  expiresAt: Date | null;
  planName: string | null;
  maxCourses: number | null;
}

interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'admin' | 'instructor' | 'user';
  subscription?: Subscription | null;
  purchasedCourses?: number[]; // Course IDs
}

interface AuthState {
  user: User | null;
  role: 'admin' | 'instructor' | 'user' | null;
  setUser: (user: User) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isInstructor: () => boolean;
  hasActiveSubscription: () => boolean;
  canAccessCourse: (courseId: number) => boolean;
  updateSubscription: (subscription: Subscription | null) => void;
  addPurchasedCourse: (courseId: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      setUser: (user) => set({ 
        user: {
          ...user,
          purchasedCourses: user.purchasedCourses || [],
        }, 
        role: user.role 
      }),
      logout: () => set({ user: null, role: null }),
      isAdmin: () => get().role === 'admin',
      isInstructor: () => get().role === 'instructor' || get().role === 'admin',
      hasActiveSubscription: () => {
        const user = get().user;
        if (!user?.subscription) return false;
        if (user.subscription.status !== 'active') return false;
        if (user.subscription.expiresAt && new Date(user.subscription.expiresAt) < new Date()) {
          return false;
        }
        return true;
      },
      canAccessCourse: (courseId: number) => {
        const user = get().user;
        if (!user) return false;
        
        // Admins and instructors can access all courses
        if (user.role === 'admin' || user.role === 'instructor') {
          return true;
        }
        
        // Check if user has active subscription
        if (get().hasActiveSubscription()) {
          return true;
        }
        
        // Check if user purchased the course
        if (user.purchasedCourses?.includes(courseId)) {
          return true;
        }
        
        return false;
      },
      updateSubscription: (subscription) => {
        const user = get().user;
        if (user) {
          set({ user: { ...user, subscription } });
        }
      },
      addPurchasedCourse: (courseId: number) => {
        const user = get().user;
        if (user) {
          const purchasedCourses = user.purchasedCourses || [];
          if (!purchasedCourses.includes(courseId)) {
            set({ 
              user: { 
                ...user, 
                purchasedCourses: [...purchasedCourses, courseId] 
              } 
            });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
