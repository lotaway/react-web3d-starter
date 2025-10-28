import {Link, Outlet, useLocation} from "react-router-dom"
import "./TabList.sass"
import {PropsWithChildren} from "react"

interface TabItem {
    path: string,
    title: string,
}

type TabList = Array<TabItem>

type TabListProps = PropsWithChildren<{
    tabList: TabList,
}>

export default function TabList({tabList, children}: TabListProps) {
    const location = useLocation()
    return (
        <div className="tab-list flex flex-col">
            <ul className="list tab-list-title flex flex-row justify-center items-center">
                {
                    tabList.map((item, index) => (
                        <li className={`item tab-list-title-item ${location.pathname.includes(item.path) ? "in-active" : "no-active"}`} key={index}>
                            <Link to={item.path} className="link transition-fast">{item.title}</Link>
                        </li>
                    ))
                }
            </ul>
            {children}
        </div>
    )
}