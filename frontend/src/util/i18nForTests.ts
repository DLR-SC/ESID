import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

void i18n
  .use(initReactI18next)
  .init({
    lng: 'cimode',
    fallbackLng: 'cimode',
    debug: false,
    resources: {
      en: {},
      de: {}
    },
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;