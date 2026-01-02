import { useEffect } from "react";
import { useLanguage, type Language } from "@/context/language-context";

const RTL_LANGUAGES: Language[] = ["ar"];

export function useLanguageDirection() {
  const { language } = useLanguage();

  useEffect(() => {
    const isRTL = RTL_LANGUAGES.includes(language);
    const html = document.documentElement;

    // Update document direction
    html.dir = isRTL ? "rtl" : "ltr";

    // Update document language
    html.lang = language;

    // Add/remove RTL class for additional styling if needed
    if (isRTL) {
      html.classList.add("rtl");
    } else {
      html.classList.remove("rtl");
    }
  }, [language]);

  return {
    isRTL: RTL_LANGUAGES.includes(language),
    direction: RTL_LANGUAGES.includes(language) ? "rtl" : "ltr",
  };
}
