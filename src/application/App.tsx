import {Outlet} from "react-router-dom"
import TabBar from "../commons/components/TabBar/TabBar"
import {useEffect} from "react"
// import * as wasm from "../../../wasm-ff/pkg/Wasm_FF"

function App() {
    useEffect(() => {
        const timer = setTimeout(() => {
            const abortController = new AbortController()
            // wasm.greet("from wasm")
            // console.log(wasm.CryptoUtils.twitter_signature("1", "2", "3", "4"))
            const urlInfo = {
                proxyPrevFix: "/twitter/api",
                host: "https://api.twitter.com",
                path: "/oauth/request_token",
            }
            // const method = "POST"
            // const fullQueryStr = wasm.CryptoUtils.twitter_signature(
            //     method,
            //     urlInfo.host + urlInfo.path,
            //     "OxhqcUXNEaQUtMMreqvRdYl38",
            //     `${location.protocol + "//" + location.host}/airdrop/bindAccount`,
            // )
            // console.log(`twitter signature fullQueryStr: ${fullQueryStr}`)
            const headers = new Headers()
            headers.set("Content-Type", "application/json")
            // fetch(`${urlInfo.proxyPrevFix}${urlInfo.path}?${fullQueryStr}`, {
            //     method,
            //     signal: abortController.signal,
            //     headers,
            // })
            //     .then(res => {
            //         console.log(`res: ${res}`)
            //         return res.json()
            //     })
            //     .then(json => {
            //         console.log(`json: ${json}`)
            //     })
            //     .catch(err => {
            //         console.log(`err: ${err}`)
            //     })
            return () => abortController.abort("useEffect callback")
        }, 150)
        return () => clearTimeout(timer)
    }, [])
    return (
        <div className="app">
            <Outlet/>
            <TabBar/>
        </div>
    )
}

export default App