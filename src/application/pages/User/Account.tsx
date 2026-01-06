import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useEffect } from "react"
import "./Account.sass"
import TabBar from "../../../commons/components/TabBar/TabBar"

export default function Account() {
    const location = useLocation()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const tabList = [
        {
            name: t("chargeTitle"),
            path: "charge"
        },
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
            <TabBar tabs={tabList} />
        </div>
    )
}