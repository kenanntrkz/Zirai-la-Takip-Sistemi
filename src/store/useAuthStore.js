import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import bcrypt from 'bcryptjs';

export const useAuthStore = create()(
  persist(
    (set) => ({
      isAuthenticated: false,
      hashedPassword: null,

      setInitialPassword: (password) => {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        set({ hashedPassword, isAuthenticated: true });
      },

      login: (password) => {
        const state = useAuthStore.getState();
        if (!state.hashedPassword) {
          state.setInitialPassword(password);
          return true;
        }

        const isValid = bcrypt.compareSync(password, state.hashedPassword);
        if (isValid) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage',
      version: 1
    }
  )
);