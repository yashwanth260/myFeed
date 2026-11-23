import { create } from 'zustand';
import { Profile } from '@cravecart/shared-types';

interface AuthState {
  user: any | null;
  profile: Profile | null;
  role: string | null;
  setAuth: (user: any, profile: Profile | null, role: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  role: null,
  setAuth: (user, profile, role) => set({ user, profile, role }),
  clearAuth: () => set({ user: null, profile: null, role: null }),
}));
