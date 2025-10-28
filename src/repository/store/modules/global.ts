import {createSlice} from '@reduxjs/toolkit'
import type {PayloadAction} from '@reduxjs/toolkit'
import i18n from 'i18next'
import {defaultLanguage, resources} from "../../../config/locale/config"
import {GlobalStates} from "./IGlobal"

const initialState: GlobalStates = {
    language: defaultLanguage,
    languageList: Object.keys(resources).map(key => {
        return {
            name: resources[key].name,
            code: key,
        }
    }) || [],
    clickCount: 0,
    pageErrorTitle: "找不到页面",
    pageMsgListTitle: "我的消息"
};
const globalSlice = createSlice({
    name: "global",
    initialState,
    reducers: {
        //  @todo sync to other app/webview/micro-service store.
        sendSync: (state, action: PayloadAction<null>) => {

        },
        //  @todo receive store from other app/webview/micron-service, update current store.
        receiveSync: (state, action: PayloadAction<typeof state>) => {
        },
        changeLanguage(state, action: PayloadAction<string>) {
            void i18n.changeLanguage(action.payload)
            state.language = action.payload
        },
        setPageTitle: (state, action: PayloadAction<string>) => {
            typeof document !== "undefined" && (document.title = action.payload);
        },
        changeClickCount: (state, action: PayloadAction<number>) => {
            state.clickCount++;
        }
    }
});

export const {sendSync, receiveSync, setPageTitle, changeClickCount} = globalSlice.actions;
export default globalSlice.reducer;
