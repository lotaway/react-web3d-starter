export interface GlobalStates {
    language: string
    languageList: Array<{
        name: string
        code: string
    }>
    clickCount: number
    pageErrorTitle: string
    pageMsgListTitle: string
}