import * as React from 'react';
import { type ReactNode } from 'react';
import { translations, type Language } from './translations';
export type { Language };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);



export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>('en');

  // Load language from localStorage on mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('kinsa-language') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
      
      // Delay to ensure Google Translate script has loaded its elements
      setTimeout(() => {
        const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (selectElement) {
          let googleLang = savedLanguage;
          if (savedLanguage === 'zh') googleLang = 'zh-CN';
          
          if (selectElement.value !== googleLang) {
            selectElement.value = googleLang;
            selectElement.dispatchEvent(new Event('change'));
          }
        }
      }, 1500);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kinsa-language', lang);

    // Trigger Google Translate
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (selectElement) {
      // Map 'zh' to 'zh-CN' as required by Google Translate
      let googleLang = lang;
      if (lang === 'zh') googleLang = 'zh-CN';
      
      selectElement.value = googleLang;
      selectElement.dispatchEvent(new Event('change'));
    }
  };

  // Translation function: When using Google Translate widget, we primarily rely on it
  // to translate the text in the DOM. The `t` function can still act as a fallback 
  // or return the English original string which Google Translate will then translate.
  const t = (key: string): string => {
    return translations['en'][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}