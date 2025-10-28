import React, {PropsWithChildren} from "react"
import {Provider} from "react-redux"
import store from "./store"

interface InjectProps {

}

export type ContextProps = PropsWithChildren<InjectProps>

export function AppStoreProvider({children}: ContextProps) {
    return (<Provider store={store}>{children}</Provider>)
}
