import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translations from './translations';

const resources: Record<string, { translation: Record<string, any> }> = {};
for (const [lang, keys] of Object.entries(translations)) {
  resources[lang] = { translation: keys };
}

const savedLang = localStorage.getItem('buksy_lang') || 'uk';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: 'uk',
  interpolation: { escapeValue: false },
});

export default i18n;
