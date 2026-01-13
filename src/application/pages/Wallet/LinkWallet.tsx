import './LinkWallet'
import React, { useContext } from "react"
import Button from "../../../commons/components/Button/Button"
import { BlockChainContext } from "../../context/BlockChainContext"
import { useTranslation } from "react-i18next"
import { WalletName } from "../../../core/IWallet"

export default function LinkWallet() {
    const { t } = useTranslation()
    const blockchain = useContext(BlockChainContext)

    if (!blockchain) return null;
    const { connectWallet, disconnectWallet, isConnected } = blockchain;

    const handleConnect = async (name: WalletName) => {
        try {
            await connectWallet(name);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="link-wallet">
            {isConnected ? (
                <Button onClick={disconnectWallet}>Disconnect</Button>
            ) : (
                <>
                    <Button onClick={() => handleConnect(WalletName.METAMASK)}>{t("metamaskTitle")}</Button>
                    <Button onClick={() => handleConnect(WalletName.PHANTOM)}>{t("phantomTitle")}</Button>
                    <Button onClick={() => handleConnect(WalletName.WALLETCONNECT)}>{t("walletConnectTitle")}</Button>
                    <Button onClick={() => handleConnect(WalletName.SOLFLARE)}>{t("solflareTitle")}</Button>
                    <Button onClick={() => handleConnect(WalletName.OKX)}>{t("okxTitle")}</Button>
                    <Button onClick={() => handleConnect(WalletName.UNISAT)}>{t("uniSatTitle")}</Button>
                </>
            )}
        </div>
    )
}