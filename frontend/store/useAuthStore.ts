import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'COACH' | 'CLIENT';

interface User {
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
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  // NOVA FUNÇÃO DA US 25:
  setUser: (userData: User) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  // AÇÃO DE LOGIN
  login: async (userData) => {
    try {
      // Guardamos no cofre
      await AsyncStorage.setItem('user_session', JSON.stringify(userData));
      // E só depois avisamos a app para mudar o ecrã
      set({ user: userData });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },

  // AÇÃO DE LOGOUT
  logout: async () => {
    try {
      await AsyncStorage.removeItem('user_session');
      set({ user: null });
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },

  // AÇÃO DE INICIALIZAÇÃO
  checkSession: async () => {
    try {
      const sessionData = await AsyncStorage.getItem('user_session');
      if (sessionData) {
        set({ user: JSON.parse(sessionData), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to read session:', error);
      set({ isLoading: false });
    }
  },

  // A NOSSA NOVA FUNÇÃO MÁGICA PARA ATUALIZAR O PERFIL (US 25)
  setUser: async (updatedUser) => {
    try {
      // 1. Atualizamos o cofre local para não perder os dados no refresh
      await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
      // 2. Atualizamos o estado da app em tempo real (ex: muda o nome logo no Dashboard)
      set({ user: updatedUser });
    } catch (error) {
      console.error('Failed to update local session:', error);
    }
  }
}));