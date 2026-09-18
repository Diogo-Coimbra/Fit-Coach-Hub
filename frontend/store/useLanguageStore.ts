import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, translations, Translations } from '../i18n/translations';

interface LanguageState {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => Promise<void>;
  initLanguage: () => Promise<void>;
  t: (path: string, paramsOrFallback?: Record<string, string | number> | string, fallback?: string) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'pt',
  translations: translations.pt,

  setLanguage: async (lang: Language) => {
    const selectedTranslations = translations[lang] || translations.pt;
    set({ language: lang, translations: selectedTranslations });
    try {
      await AsyncStorage.setItem('app_language', lang);
    } catch (e) {
      console.warn('Erro ao guardar idioma selecionado:', e);
    }
  },

  initLanguage: async () => {
    try {
      const savedLang = (await AsyncStorage.getItem('app_language')) as Language | null;
      if (savedLang && translations[savedLang]) {
        set({ language: savedLang, translations: translations[savedLang] });
      }
    } catch (e) {
      console.warn('Erro ao carregar idioma inicial:', e);
    }
  },

  t: (path: string, paramsOrFallback?: Record<string, string | number> | string, fallback?: string): string => {
    const keys = path.split('.');
    let current: any = get().translations;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        const defaultText = typeof paramsOrFallback === 'string' ? paramsOrFallback : fallback || path;
        return defaultText;
      }
    }
    let text = typeof current === 'string' ? current : (typeof paramsOrFallback === 'string' ? paramsOrFallback : fallback || path);
    if (typeof paramsOrFallback === 'object' && paramsOrFallback !== null) {
      Object.entries(paramsOrFallback).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }
    return text;
  },
}));

// Hook simplificado para os componentes
export function useLanguage() {
  const { language, translations, setLanguage, t } = useLanguageStore();
  return {
    language,
    translations,
    setLanguage,
    t,
  };
}
