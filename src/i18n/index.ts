import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import EN from './locales/en'
import CN from './locales/cn'

const resources = {
    en: {
        translation: EN
    },
    cn: {
        translation: CN
    }
}

i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    interpolation: {
        escapeValue: false
    }
})

export default i18n