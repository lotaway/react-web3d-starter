import {configureStore} from "@reduxjs/toolkit"
import globalReducer from './modules/global'
import advertiseReducer from './modules/advertise'

const store = configureStore({
    reducer: {
        global: globalReducer,
        advertise: advertiseReducer
    }
})
export type RootStates = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
