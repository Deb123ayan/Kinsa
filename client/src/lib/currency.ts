import type { Language } from '@/context/translations';

// ── Currency map: language → { currency code, locale, approx conversion rate from INR } ──
const CURRENCY_MAP: Record<Language, { code: string; locale: string; rate: number }> = {
  en:  { code: 'USD', locale: 'en-US',    rate: 0.012  },  // English  → US Dollar
  hi:  { code: 'INR', locale: 'en-IN',    rate: 1      },  // Hindi    → Indian Rupee
  bn:  { code: 'BDT', locale: 'bn-BD',    rate: 0.013  },  // Bengali  → Bangladeshi Taka (approx parity group)
  es:  { code: 'EUR', locale: 'es-ES',    rate: 0.011  },  // Spanish  → Euro
  fr:  { code: 'EUR', locale: 'fr-FR',    rate: 0.011  },  // French   → Euro
  de:  { code: 'EUR', locale: 'de-DE',    rate: 0.011  },  // German   → Euro
  zh:  { code: 'CNY', locale: 'zh-CN',    rate: 0.086  },  // Chinese  → Yuan
  ar:  { code: 'AED', locale: 'ar-AE',    rate: 0.044  },  // Arabic   → UAE Dirham
  pt:  { code: 'BRL', locale: 'pt-BR',    rate: 0.063  },  // Portuguese → Brazilian Real
  ru:  { code: 'RUB', locale: 'ru-RU',    rate: 1.10   },  // Russian  → Ruble
  ja:  { code: 'JPY', locale: 'ja-JP',    rate: 1.78   },  // Japanese → Yen
  ko:  { code: 'KRW', locale: 'ko-KR',    rate: 16.1   },  // Korean   → Won
  it:  { code: 'EUR', locale: 'it-IT',    rate: 0.011  },  // Italian  → Euro
  tr:  { code: 'TRY', locale: 'tr-TR',    rate: 0.38   },  // Turkish  → Lira
  nl:  { code: 'EUR', locale: 'nl-NL',    rate: 0.011  },  // Dutch    → Euro
  vi:  { code: 'VND', locale: 'vi-VN',    rate: 295    },  // Vietnamese → Dong
  th:  { code: 'THB', locale: 'th-TH',    rate: 0.42   },  // Thai     → Baht
  id:  { code: 'IDR', locale: 'id-ID',    rate: 188    },  // Indonesian → Rupiah
};

export function getCurrencyConfig(language: Language) {
  return CURRENCY_MAP[language] ?? CURRENCY_MAP['en'];
}

export function formatPrice(amount: number, language: Language = 'en'): string {
  const { code, locale, rate } = getCurrencyConfig(language);
  const converted = amount * rate;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    maximumFractionDigits: code === 'JPY' || code === 'KRW' || code === 'VND' || code === 'IDR' ? 0 : 2,
  }).format(converted);
}

export function formatPriceWithUnit(amount: number, unit: string, language: Language = 'en'): string {
  return `${formatPrice(amount, language)}/${unit}`;
}
