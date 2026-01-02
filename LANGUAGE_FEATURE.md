# Multi-Language Support Feature

## Overview
The KINSA Global platform now supports multiple languages to serve our international partners better. Users can select their preferred language from the dashboard and throughout the application.

## Supported Languages
- **English** (en) - Default
- **Hindi** (hi) - हिन्दी
- **Spanish** (es) - Español
- **French** (fr) - Français
- **German** (de) - Deutsch
- **Chinese** (zh) - 中文
- **Arabic** (ar) - العربية (RTL support)

## Features

### Language Persistence
- Language selection is saved in localStorage
- Preference persists across browser sessions
- Automatically applied when user logs in

### Language Selector
- Available in header (compact view)
- Available in mobile menu (full view)
- Shows current language with native script
- Dropdown with all available languages

### RTL Support
- Automatic detection for RTL languages (Arabic)
- Document direction updates automatically
- CSS classes added for RTL-specific styling

### Translated Elements
- Navigation menu
- Dashboard welcome message and sections
- Order management interface
- Table headers and common actions
- Status indicators
- Form labels and buttons

## Implementation Details

### Context Provider
- `LanguageProvider` wraps the entire application
- Provides `useLanguage()` hook for components
- Translation function `t(key)` for text lookup

### Translation Keys
- Organized by feature area (nav, dashboard, common, etc.)
- Fallback to key if translation missing
- Consistent naming convention

### Components
- `LanguageSelector` - Dropdown component for language selection
- `useLanguageDirection` - Hook for RTL/LTR handling
- Integrated into existing layout and dashboard

## Usage

### For Users
1. Click the globe icon in the header
2. Select preferred language from dropdown
3. Interface updates immediately
4. Language preference is remembered

### For Developers
```tsx
import { useLanguage } from '@/context/language-context';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('dashboard.welcome')}</h1>
      <p>Current language: {language}</p>
    </div>
  );
}
```

## Adding New Languages

1. Add language code to `Language` type in `language-context.tsx`
2. Add translations to `translations` object
3. Add to `languages` array in `language-selector.tsx`
4. Update RTL_LANGUAGES array if RTL language

## Adding New Translations

1. Add key to English translations first
2. Add same key to all other language objects
3. Use descriptive, hierarchical keys (e.g., 'dashboard.welcome')
4. Test with different languages to ensure proper display

## Browser Support
- Modern browsers with localStorage support
- CSS direction property support for RTL
- Unicode font support for international characters

## Future Enhancements
- Dynamic language loading
- Professional translation services integration
- More granular regional variants
- Currency and date formatting per locale