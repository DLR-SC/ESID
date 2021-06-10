import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import JSON5 from 'json5';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

void i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    defaultNS: 'global',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator'], // Make sure that the browser language is the app language. This also prevents cookies.
      caches: [], // This prevents the use of cookies.
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json5',
      parse(data: string): string {
        return JSON5.parse(data);
      },
    },
  });

export default i18n;
