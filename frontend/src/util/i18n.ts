import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import JSON5 from 'json5';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import enBackend from 'locales/en/backend.json5';
import enLegal from 'locales/en/legal.json5';
import enGlobal from 'locales/en/global.json5';
import enTranslation from 'locales/en/translation.json5';

import deBackend from 'locales/de/backend.json5';
import deLegal from 'locales/de/legal.json5';
import deGlobal from 'locales/de/global.json5';
import deTranslation from 'locales/de/translation.json5';

const translationFiles = [
  enBackend,
  enLegal,
  enGlobal,
  enTranslation,
  deBackend,
  deLegal,
  deGlobal,
  deTranslation,
] as Array<string>;

void i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(
    {
      // By default, i18next loads the user language AND the fallback language, thus if the user has the browser set to
      // German it would load 'de' and 'en'. Since we also provide complete translations for German, we set it to the
      // fallback language to avoid loading both translations.
      fallbackLng: navigator.language.startsWith('de') ? 'de' : 'en',
      supportedLngs: ['de', 'en'],
      defaultNS: 'global',
      load: 'languageOnly',
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        // Make sure that the browser language is the app or the user selected language. This also prevents cookies.
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'], // This prevents the use of cookies.
      },
      backend: {
        loadPath: (lngs, namespaces) => {
          return (
            translationFiles.find(
              (path: string) => path.includes(`/${lngs[0]}/`) && path.includes(`/${namespaces[0]}`)
            ) || ''
          );
        },
        parse(data: string) {
          return JSON5.parse(data);
        },
      },
    },
    undefined
  )
  .then(() => (document.documentElement.lang = i18n.language));

export default i18n;
