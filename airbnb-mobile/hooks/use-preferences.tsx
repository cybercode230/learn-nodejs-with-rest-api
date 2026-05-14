/**
 * usePreferences Hook
 * Manages app preferences such as theme, language, and currency.
 */
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { LANGUAGES } from '@/constants/languages';

type Theme = 'light' | 'dark' | 'system';

interface PreferencesContextType {
  theme: Theme;
  language: string; // ISO code
  setTheme: (theme: Theme) => Promise<void>;
  setLanguage: (lang: string) => Promise<void>;
  isDark: boolean;
  languageName: string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const PREFS_KEY = 'airbnb_preferences';

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('light');
  const [language, setLanguageState] = useState<string>('en-US');

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const savedPrefs = await AsyncStorage.getItem(PREFS_KEY);
        if (savedPrefs) {
          const { theme: savedTheme, language: savedLang } = JSON.parse(savedPrefs);
          if (savedTheme) setThemeState(savedTheme);
          if (savedLang) setLanguageState(savedLang);
        }
      } catch (e) {}
    };
    loadPrefs();
  }, []);

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      const savedPrefs = await AsyncStorage.getItem(PREFS_KEY);
      const current = savedPrefs ? JSON.parse(savedPrefs) : {};
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, theme: newTheme }));
    } catch (e) {}
  }, []);

  const setLanguage = useCallback(async (newLang: string) => {
    setLanguageState(newLang);
    try {
      const savedPrefs = await AsyncStorage.getItem(PREFS_KEY);
      const current = savedPrefs ? JSON.parse(savedPrefs) : {};
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, language: newLang }));
    } catch (e) {}
  }, []);

  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark';
  
  const languageName = useMemo(() => {
    return LANGUAGES.find(l => l.code === language)?.name || 'English';
  }, [language]);

  return (
    <PreferencesContext.Provider value={{ 
      theme, 
      language, 
      setTheme, 
      setLanguage, 
      isDark,
      languageName 
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used within PreferencesProvider');
  return context;
}
