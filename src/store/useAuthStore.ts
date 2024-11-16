import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateDeviceId } from '../utils/deviceId';
import { encryptData, decryptData } from '../utils/encryption';
import toast from 'react-hot-toast';

interface AuthState {
  isAuthenticated: boolean;
  deviceId: string | null;
  activationDate: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  validateSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      deviceId: null,
      activationDate: null,

      login: async (username: string, password: string) => {
        try {
          // Demo için sabit kullanıcı bilgileri
          const validUsername = 'demo';
          const validPassword = 'demo123';

          if (username === validUsername && password === validPassword) {
            const deviceId = await generateDeviceId();
            const storedDeviceId = get().deviceId;

            if (!storedDeviceId) {
              // İlk giriş
              set({
                isAuthenticated: true,
                deviceId: encryptData(deviceId),
                activationDate: new Date().toISOString()
              });
              toast.success('Giriş başarılı');
              return true;
            } else {
              // Cihaz kontrolü
              const decryptedDeviceId = decryptData(storedDeviceId);
              if (decryptedDeviceId === deviceId) {
                set({ isAuthenticated: true });
                toast.success('Giriş başarılı');
                return true;
              } else {
                toast.error('Bu hesap başka bir cihazda aktif');
                return false;
              }
            }
          }
          
          toast.error('Geçersiz kullanıcı adı veya şifre');
          return false;
        } catch (error) {
          console.error('Login error:', error);
          toast.error('Giriş sırasında bir hata oluştu');
          return false;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          deviceId: null,
          activationDate: null
        });
        localStorage.clear();
        toast.success('Çıkış yapıldı');
      },

      validateSession: async () => {
        try {
          const state = get();
          if (!state.deviceId) return false;

          const currentDeviceId = await generateDeviceId();
          const decryptedDeviceId = decryptData(state.deviceId);

          return currentDeviceId === decryptedDeviceId;
        } catch (error) {
          console.error('Session validation error:', error);
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      version: 2
    }
  )
);