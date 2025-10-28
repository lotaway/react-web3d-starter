import React from "react"
import {useAppSelector, useAppDispatch} from "./hooks"
import {changeClickCount} from "./modules/global"
import {AppStoreProvider} from "./container"

namespace NSPage {
    interface Props {
    }

    export const Render: React.FC<Props> = props => {
        const clickCount = useAppSelector(state => state.global.clickCount)
        const dispatch = useAppDispatch()
        return (
            <AppStoreProvider>
                <div onClick={() => dispatch(changeClickCount(clickCount + 1))}>{clickCount}</div>
            </AppStoreProvider>
        );
    }
}
