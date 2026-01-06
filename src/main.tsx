import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import './application/index.sass'
import './config/locale/config'
import { AppStoreProvider } from "./repository/store/container"
import { BlockChainProvider } from "./application/context/BlockChainContext"
import App from './application/App'
import UserCenter from "./application/pages/User/UserCenter"
import NewWorld from "./application/pages/NewWorld/NewWorld"
import Charge from "./application/pages/User/Charge"
import Account from "./application/pages/User/Account"
import LinkWallet from "./application/pages/Wallet/LinkWallet"

const routers = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                // path: "home",    //  use index no allow path
                element: <NewWorld />
            },
            {
                path: "user",
                element: <UserCenter />,
                children: [
                    {
                        path: "account",
                        element: <Account />,
                        children: [
                            {
                                path: "charge",
                                element: <Charge />,
                            },
                        ]
                    },
                ]
            }
        ]
    },
    {
        path: "/wallet/linkWallet",
        element: <LinkWallet />,
    },
    {
        path: "*",
        element: <Navigate to="/" />
    }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <AppStoreProvider>
        <BlockChainProvider>
            <React.StrictMode>
                <RouterProvider router={routers} />
            </React.StrictMode>
        </BlockChainProvider>
    </AppStoreProvider>
)
