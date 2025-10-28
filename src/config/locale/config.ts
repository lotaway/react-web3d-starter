import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'

import translation_en from "./en.json"
// import translation_zh from "./zh.json"

interface Resources {
    [key: string]: {
        name: string
        translation: object
    }
}

export const resources: Resources = {
    en: {
        name: "English",
        translation: translation_en
    },
    /*zh: {
        name: "中文",
        translation: translation_zh
    },*/
}

export const defaultLanguage =
    (() => {
        return Object.keys(resources).find(item => navigator.language.includes(item))
    })() || "en"

i18n.use(initReactI18next).init({
    resources,
    lng: defaultLanguage,
    interpolation: {
        escapeValue: false
    }
})

export default i18n