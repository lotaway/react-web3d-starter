import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom"
import './application/index.sass'
import './config/locale/config'
import {AppStoreProvider} from "./repository/store/container"
import {BlockChainProvider} from "./application/context/BlockChainContext"
import App from './application/App'
import configHost from "./config/host"
import Home from "./application/pages/Home/Home"
import ShopIndex from "./application/pages/Shop/Index"
import GoodsDetail from "./application/pages/Shop/GoodsDetail"
import SignUp from "./application/pages/User/SignUp"
import LogIn from "./application/pages/User/LogIn"
import UserCenter from "./application/pages/User/UserCenter"
import TransactionRecord from "./application/pages/Wallet/TransactionRecord"
import NewWorld from "./application/pages/NewWorld/NewWorld"
import Auth from "./commons/layouts/Auth/Auth"
import Charge from "./application/pages/User/Charge"
import Withdrawal from "./application/pages/User/Withdrawal"
import Account from "./application/pages/User/Account"
// const ShopIndex = lazy(() => import("./application/pages/Shop/Index"))
import LinkWallet from "./application/pages/Wallet/LinkWallet"

const routers = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            {
                index: true,
                // path: "home",    //  use index no allow path
                element: <Home/>
            },
            {
                path: "shop",
                element: <ShopIndex/>,
                children: [
                    /*{
                        path: "goods/:id",
                        element: <GoodsDetail/>
                    }*/
                ]
            },
            {
                path: "user",
                element: <UserCenter/>,
                children: [
                    {
                        path: "account",
                        element: <Account/>,
                        children: [
                            {
                                path: "charge",
                                element: <Charge/>,
                            },
                            {
                                path: "withdrawal",
                                element: <Withdrawal/>,
                            },
                        ]
                    },
                ]
            }
        ]
    },
    {
        path: "/auth",
        element: <Auth/>,
        children: [
            {
                index: true,
                //  path: "/signUp",
                element: <SignUp/>
            },
            {
                path: "logIn",
                element: <LogIn/>
            }
        ]
    },
    {
        path: "/shop/goods/:id",
        element: <GoodsDetail/>,
        loader: ({params}) => {
            return fetch(`${configHost.goodsService}/salesOutlets/goods/recommend/details?goodId=${params.id}`);
        }
    },
    {
        path: "/user/payRecord",
        element: <TransactionRecord/>,
    },
    {
        path: "/wallet/linkWallet",
        element: <LinkWallet/>,
    },
    {
        path: "/NewWorld",
        element: <NewWorld/>
    },
    {
        path: "*",
        element: <Navigate to="/"/>
    }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <AppStoreProvider>
        <BlockChainProvider>
            <React.StrictMode>
                <RouterProvider router={routers}/>
            </React.StrictMode>
        </BlockChainProvider>
    </AppStoreProvider>
)
