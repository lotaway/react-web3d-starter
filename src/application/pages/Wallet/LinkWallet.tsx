import './LinkWallet'
import React, {useContext} from "react"
import Card from "../../../commons/layouts/Card/Card"
import Button from "../../../commons/components/Button/Button"
import {BlockChainContext} from "../../context/BlockChainContext"
import {useTranslation} from "react-i18next"

export default function LinkWallet() {
    const {t} = useTranslation()
    const {initWalletConnect, connectWallet} = useContext(BlockChainContext)

    return (
        <div className="link-wallet">
            <Card>
                <Card.Body>
                    Link Wallet Options List
                    <button>{t("uniSatTitle")}</button>
                    <Button onClick={async () => {
                        try {
                            await initWalletConnect()
                            await connectWallet()
                        } catch (e) {
                            alert(e)
                        }
                    }}>{t("metamaskTitle")}</Button>
                    <button>{t("walletConnectTitle")}</button>
                </Card.Body>
            </Card>
        </div>
    )
}