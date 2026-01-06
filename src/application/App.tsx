import {Outlet} from "react-router-dom"
import TabBar from "../commons/components/TabBar/TabBar"
// import * as wasm from "../../../wasm-ff/pkg/Wasm_FF"

function App() {
    return (
        <div className="app">
            <Outlet/>
            <TabBar/>
        </div>
    )
}

export default App