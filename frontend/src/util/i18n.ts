// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import JSON5 from 'json5';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import 'dayjs/locale/en';
import 'dayjs/locale/de';

const translationFiles = [
  new URL('../../locales/en-backend.json5', import.meta.url).href,
  new URL('../../locales/en-legal.json5', import.meta.url).href,
  new URL('../../locales/en-global.json5', import.meta.url).href,
  new URL('../../locales/en-translation.json5', import.meta.url).href,
  new URL('../../locales/de-backend.json5', import.meta.url).href,
  new URL('../../locales/de-legal.json5', import.meta.url).href,
  new URL('../../locales/de-global.json5', import.meta.url).href,
  new URL('../../locales/de-translation.json5', import.meta.url).href,
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
        loadPath: (lngs: string, namespaces: string) => {
          return translationFiles.find((path: string) => path.includes(`${lngs[0]}-${namespaces[0]}`)) ?? '';
        },
        parse(data: string): string {
          return JSON5.parse(data);
        },
      },
    },
    undefined
  )
  .then(() => (document.documentElement.lang = i18n.language));

export default i18n;
