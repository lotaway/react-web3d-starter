import React, {useEffect, useReducer, createContext, useContext, PropsWithChildren} from 'react'

//  使用上下文抽象出部分组件之间共用的状态
type Props = PropsWithChildren<{}>

interface States extends Object {

}

let initialState: States = {

}

const actionType = {
    setPlus: "setPlus"
}

const reducer = (prevState:States, action: any) => {
    switch (action.type) {
    }
    return prevState
}

const AppContext = createContext<States>({} as States)
const useAppContext = () => {
    const [state, dispatch] = useReducer(reducer, initialState)
    useEffect(() => {

    }, [])
    return state
}

//高阶组件，给函数组件注入上下文
export const AppProvider = (props: Props) => {
    return (
        <AppContext.Provider value={useAppContext()}>
            {props.children}
        </AppContext.Provider>
    )
}

function demo() {
    const appContext = useContext(AppContext)
    return (
        <AppProvider>
            <div>{JSON.stringify(appContext)}</div>
        </AppProvider>
    )
}
