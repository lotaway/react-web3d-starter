import {useEffect} from "react"
import {Link, Outlet, useLocation} from "react-router-dom"
import "./TabBar.css"
import {useTranslation} from "react-i18next"

export type Tab = {
    path: string
    name: string
}

type Props = {
    tabs?: Tab[]
};

type TabBarItemProps = {
    path: string
    title: string
};
const TabBarItem = ({path, title}: TabBarItemProps) => {
    const {pathname} = useLocation();
    useEffect(() => {
    }, [pathname]);
    return (
        <li className={pathname === path ? ' in-active' : ' no-active'}>
            <Link to={path}>{title}</Link>
        </li>
    )
}

export default function TabBar(props: Props) {
    const {t} = useTranslation()
    return (
        <ul className="w-full flex md:justify-center justify-between tab-bar">
            <ul className="list text-black md:flex hidden">
                {
                    (props.tabs ?? [{
                        path: "/index",
                        name: t("homeTitle")
                    }, {
                        path: "/shop",
                        name: t("shopTitle")
                    }, {
                        path: "/user/center",
                        name: t("userCenterTitle")
                    }]).map(item => (
                        <TabBarItem key={item.path} path={item.path} title={item.name}/>
                    ))
                }
            </ul>
        </ul>
    );
}