import { configureStore } from "@reduxjs/toolkit"
import globalReducer from './modules/global'
import advertiseReducer from './modules/advertise'
import userReducer from './modules/user'

const store = configureStore({
    reducer: {
        global: globalReducer,
        advertise: advertiseReducer,
        user: userReducer
    }
})
export type RootStates = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
