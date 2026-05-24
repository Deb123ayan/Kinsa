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

// ── Reliably apply a language to the Google Translate combo ──────────────────
// Retries every 200 ms for up to 5 s in case the widget hasn't loaded yet.
function triggerGoogleTranslate(lang: Language) {
  const googleLang = lang === 'zh' ? 'zh-CN' : lang;

  const tryApply = () => {
    const sel = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (sel) {
      if (sel.value !== googleLang) {
        sel.value = googleLang;
        sel.dispatchEvent(new Event('change'));
      }
      return true; // success
    }
    return false;
  };

  if (tryApply()) return; // already in DOM → done immediately

  // Not in DOM yet – watch for it AND poll as a fallback
  let attempts = 0;
  const MAX = 25; // 25 × 200 ms = 5 s max wait

  const observer = new MutationObserver(() => {
    if (tryApply()) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  const interval = setInterval(() => {
    attempts++;
    if (tryApply() || attempts >= MAX) {
      clearInterval(interval);
      observer.disconnect();
    }
  }, 200);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>('en');

  // Load language from localStorage on mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('kinsa-language') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
      triggerGoogleTranslate(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kinsa-language', lang);
    triggerGoogleTranslate(lang);
  };

  // Translation function – relies on Google Translate for DOM translation;
  // t() returns the English string which GT then replaces in the DOM.
  const t = (key: string): string => {
    return translations['en'][key] || key;
  };

  const value = { language, setLanguage, t };

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