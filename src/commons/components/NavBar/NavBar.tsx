import {useEffect} from "react"
import {Link, useLocation} from "react-router-dom"
import style from "./NavBar.module.sass"
import logo from "../../../application/assets/logo.svg"
import {useTranslation} from "react-i18next"

export default function NavBar() {
    const location = useLocation()
    const {t} = useTranslation()
    useEffect(() => {
        // console.log(`change location!:${location.pathname}, need to change view`)
    }, [location.pathname])
    return (
        <nav className="w-full flex nav-bar">
            <h1 className="md:flex-[0.5] flex-initial ">
                <Link to="/">
                    <object className={style.logo} type="image/svg+xml" data={logo}/>
                </Link>
            </h1>
            <button type="button">{t("menuTitle")}</button>
        </nav>
    )

}