import i18n from 'i18next';
import { z } from "zod";
import { initReactI18next } from 'react-i18next';
import { zodI18nMap } from "zod-i18n-map";

import frCommon from './locales/fr/common.json';
import enCommon from './locales/en/common.json';

import enZod from "zod-i18n-map/locales/en/zod.json";
import frZod from "zod-i18n-map/locales/fr/zod.json";

const resources = {
    en: {
        common: enCommon,
        zod: enZod,
    },
    fr: {
        common: frCommon,
        zod: frZod,
    },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'fr',
        defaultNS: 'common',

        interpolation: {
            escapeValue: false,
        },

        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

z.setErrorMap(zodI18nMap);
export { z }

export default i18n;