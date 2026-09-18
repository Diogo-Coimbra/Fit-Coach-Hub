import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'COACH' | 'CLIENT';

export interface User {
  id?: string;
  name: string;
  email: string;
  picture?: string;
  role?: UserRole;
  weeklyGoal?: number;
  currentStreak?: number;
  dailyCalories?: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  trialEndsAt?: string | null;
  stripeCustomerId?: string | null;
  subscriptionStatus?: string | null;
}

export interface CoachInfo {
  id: string;
  name: string;
  email: string;
  picture?: string | null;
}

export interface TrialInfo {
  trialEndsAt: string | null;
  daysLeft: number;
  isExpired: boolean;
  isSubscribed?: boolean;
  status: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  coach: CoachInfo | null;
  trial: TrialInfo | null;
  isLoading: boolean;

  login: (userData: User, token?: string, coach?: CoachInfo | null, trial?: TrialInfo | null) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  setUser: (userData: User) => Promise<void>;
  setCoach: (coachData: CoachInfo | null) => Promise<void>;
  setTrial: (trialData: TrialInfo | null) => void;
  switchRole: (targetRole: UserRole) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  coach: null,
  trial: null,
  isLoading: true,

  // AÇÃO DE LOGIN
  login: async (userData, token, coach = null, trial = null) => {
    try {
      await AsyncStorage.setItem('user_session', JSON.stringify(userData));
      if (token) {
        await AsyncStorage.setItem('auth_token', token);
      }
      if (coach) {
        await AsyncStorage.setItem('user_coach', JSON.stringify(coach));
      } else {
        await AsyncStorage.removeItem('user_coach');
      }
      if (trial) {
        await AsyncStorage.setItem('user_trial', JSON.stringify(trial));
      }

      set({
        user: userData,
        token: token || null,
        coach: coach || null,
        trial: trial || null,
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },

  // AÇÃO DE LOGOUT
  logout: async () => {
    try {
      await AsyncStorage.multiRemove(['user_session', 'auth_token', 'user_coach', 'user_trial']);
      set({ user: null, token: null, coach: null, trial: null });
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },

  // AÇÃO DE INICIALIZAÇÃO / VERIFICAÇÃO DE SESSÃO
  checkSession: async () => {
    try {
      const [sessionData, tokenData, coachData, trialData] = await Promise.all([
        AsyncStorage.getItem('user_session'),
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('user_coach'),
        AsyncStorage.getItem('user_trial'),
      ]);

      if (sessionData) {
        set({
          user: JSON.parse(sessionData),
          token: tokenData || null,
          coach: coachData ? JSON.parse(coachData) : null,
          trial: trialData ? JSON.parse(trialData) : null,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to read session:', error);
      set({ isLoading: false });
    }
  },

  // ATUALIZAR PERFIL DO UTILIZADOR
  setUser: async (updatedUser) => {
    try {
      await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.error('Failed to update local session:', error);
    }
  },

  // ASSOCIAR OU ATUALIZAR TREINADOR
  setCoach: async (coachData) => {
    try {
      if (coachData) {
        await AsyncStorage.setItem('user_coach', JSON.stringify(coachData));
      } else {
        await AsyncStorage.removeItem('user_coach');
      }
      set({ coach: coachData });
    } catch (error) {
      console.error('Failed to update coach info:', error);
    }
  },

  // ATUALIZAR INFORMAÇÃO DE TRIAL
  setTrial: (trialData) => {
    set({ trial: trialData });
  },

  // ALTERNAR PAPEL (COACH <-> CLIENT)
  switchRole: async (targetRole) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updated = { ...currentUser, role: targetRole };
    await AsyncStorage.setItem('user_session', JSON.stringify(updated));
    set({ user: updated });
  },
}));