import {useLocation, useNavigate} from "react-router-dom"
import Card from "../../../commons/layouts/Card/Card"
import {useTranslation} from "react-i18next"
import {useEffect} from "react"
import "./Account.sass"

export default function Account() {
    const location = useLocation()
    const navigate = useNavigate()
    const {t} = useTranslation()
    const tabList = [
        {
            title: t("chargeTitle"),
            path: "charge"
        },
        {
            title: t("withdrawalTitle"),
            path: "withdrawal"
        }
    ]
    useEffect(() => {
        if (location.pathname.endsWith("account"))
            navigate("charge")
    }, [])
    return (
        <div className="account flex justify-center">
            <div className="account-charge-intro">
                <h3 className="intro-title">
                </h3>
            </div>
            <Card.Tab tabList={tabList}/>
        </div>
    )
}