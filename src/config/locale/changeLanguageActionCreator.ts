export const CHANGE_LANGUAGE = "change_language"

export const changeLanguageActionCreator = (languageCode: string) => {
    return {
        type: CHANGE_LANGUAGE,
        payload: languageCode,
    }
}