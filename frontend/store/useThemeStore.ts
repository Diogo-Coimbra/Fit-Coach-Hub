import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, ColorScheme } from '../theme';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  colors: ColorScheme;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  initTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'dark',
  colors: darkColors,

  setTheme: async (mode: ThemeMode) => {
    const selectedColors = mode === 'light' ? lightColors : darkColors;
    set({ mode, colors: selectedColors });
    try {
      await AsyncStorage.setItem('app_theme', mode);
    } catch (e) {
      console.warn('Erro ao guardar tema:', e);
    }
  },

  toggleTheme: async () => {
    const nextMode: ThemeMode = get().mode === 'dark' ? 'light' : 'dark';
    await get().setTheme(nextMode);
  },

  initTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        const selectedColors = savedTheme === 'light' ? lightColors : darkColors;
        set({ mode: savedTheme, colors: selectedColors });
      }
    } catch (e) {
      console.warn('Erro ao carregar tema inicial:', e);
    }
  },
}));

// Hook simplificado para os componentes
export function useTheme() {
  const { mode, colors, setTheme, toggleTheme } = useThemeStore();
  return {
    mode,
    colors,
    isDark: mode === 'dark',
    setTheme,
    toggleTheme,
  };
}
