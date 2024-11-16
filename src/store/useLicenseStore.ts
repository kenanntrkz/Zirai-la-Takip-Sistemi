import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateMachineId } from '../utils/machineId';
import { encryptData, decryptData, hashData } from '../utils/encryption';
import { validateLicenseKey } from '../utils/licenseValidation';
import toast from 'react-hot-toast';

interface LicenseState {
  isActivated: boolean;
  licenseKey: string | null;
  machineId: string | null;
  activationDate: string | null;
  lastCheckDate: string | null;
  offlineDays: number;
  activationHash: string | null;
  activationAttempts: number;
  lastAttemptTime: string | null;
  customerInfo: {
    name: string | null;
    email: string | null;
    company: string | null;
    expiryDate: string | null;
  };
  activateLicense: (key: string, customerInfo: any) => Promise<boolean>;
  deactivateLicense: () => void;
  validateLicense: () => Promise<boolean>;
  getRemainingDays: () => number;
}

const MAX_OFFLINE_DAYS = 7;
const MAX_ACTIVATION_ATTEMPTS = 3;
const ATTEMPT_TIMEOUT_MINUTES = 30;

export const useLicenseStore = create<LicenseState>()(
  persist(
    (set, get) => ({
      isActivated: false,
      licenseKey: null,
      machineId: null,
      activationDate: null,
      lastCheckDate: null,
      offlineDays: 0,
      activationHash: null,
      activationAttempts: 0,
      lastAttemptTime: null,
      customerInfo: {
        name: null,
        email: null,
        company: null,
        expiryDate: null
      },

      activateLicense: async (key: string, customerInfo: any) => {
        const state = get();
        const now = new Date();

        // Deneme sayısı kontrolü
        if (state.activationAttempts >= MAX_ACTIVATION_ATTEMPTS) {
          const lastAttempt = state.lastAttemptTime ? new Date(state.lastAttemptTime) : null;
          if (lastAttempt) {
            const diffMinutes = Math.floor((now.getTime() - lastAttempt.getTime()) / (1000 * 60));
            if (diffMinutes < ATTEMPT_TIMEOUT_MINUTES) {
              const remainingMinutes = ATTEMPT_TIMEOUT_MINUTES - diffMinutes;
              toast.error(`Çok fazla deneme yapıldı. ${remainingMinutes} dakika sonra tekrar deneyin.`);
              return false;
            }
          }
        }

        try {
          // Lisans anahtarı doğrulama
          const validationResult = await validateLicenseKey(key);
          if (!validationResult.isValid) {
            set(state => ({
              activationAttempts: state.activationAttempts + 1,
              lastAttemptTime: now.toISOString()
            }));
            toast.error(validationResult.error || 'Geçersiz lisans anahtarı');
            return false;
          }

          const machineId = await generateMachineId();
          const encryptedKey = encryptData(key);
          const activationDate = now.toISOString();
          
          // Aktivasyon hash'ini oluştur
          const activationData = `${machineId}|${encryptedKey}|${activationDate}|${customerInfo.email}`;
          const activationHash = hashData(activationData);
          
          set({
            isActivated: true,
            licenseKey: encryptedKey,
            machineId,
            activationDate,
            lastCheckDate: activationDate,
            offlineDays: 0,
            activationHash,
            activationAttempts: 0,
            lastAttemptTime: null,
            customerInfo: {
              ...customerInfo,
              expiryDate: validationResult.licenseInfo?.expiryDate
            }
          });

          return true;
        } catch (error) {
          console.error('License activation error:', error);
          toast.error('Lisans aktivasyonu başarısız');
          return false;
        }
      },

      deactivateLicense: () => {
        set({
          isActivated: false,
          licenseKey: null,
          machineId: null,
          activationDate: null,
          lastCheckDate: null,
          offlineDays: 0,
          activationHash: null,
          activationAttempts: 0,
          lastAttemptTime: null,
          customerInfo: {
            name: null,
            email: null,
            company: null,
            expiryDate: null
          }
        });
        
        localStorage.clear();
        toast.success('Lisans devre dışı bırakıldı');
      },

      validateLicense: async () => {
        const state = get();
        
        if (!state.licenseKey || !state.machineId || !state.activationHash) {
          set({ isActivated: false });
          return false;
        }

        try {
          // Cihaz kontrolü
          const currentMachineId = await generateMachineId();
          if (currentMachineId !== state.machineId) {
            set({ isActivated: false });
            localStorage.clear();
            toast.error('Lisans başka bir cihaza ait');
            return false;
          }

          // Hash doğrulama
          const activationData = `${state.machineId}|${state.licenseKey}|${state.activationDate}|${state.customerInfo.email}`;
          const currentHash = hashData(activationData);
          if (currentHash !== state.activationHash) {
            set({ isActivated: false });
            localStorage.clear();
            toast.error('Lisans bütünlüğü bozulmuş');
            return false;
          }

          // Süre kontrolü
          if (state.customerInfo.expiryDate) {
            const expiryDate = new Date(state.customerInfo.expiryDate);
            if (expiryDate < new Date()) {
              set({ isActivated: false });
              localStorage.clear();
              toast.error('Lisans süresi dolmuş');
              return false;
            }
          }

          // Çevrimdışı gün kontrolü
          const lastCheck = new Date(state.lastCheckDate || '');
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays > MAX_OFFLINE_DAYS) {
            set({ isActivated: false });
            localStorage.clear();
            toast.error(`${MAX_OFFLINE_DAYS} günden fazla çevrimdışı kullanım tespit edildi`);
            return false;
          }

          set({ 
            lastCheckDate: now.toISOString(),
            offlineDays: diffDays
          });
          
          return true;
        } catch (error) {
          console.error('License validation error:', error);
          set({ isActivated: false });
          localStorage.clear();
          toast.error('Lisans doğrulama hatası');
          return false;
        }
      },

      getRemainingDays: () => {
        const state = get();
        if (!state.customerInfo.expiryDate) return 0;
        
        const expiryDate = new Date(state.customerInfo.expiryDate);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }),
    {
      name: 'license-storage',
      version: 5,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.validateLicense();
        }
      }
    }
  )
);