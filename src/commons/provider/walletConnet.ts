import {Web3Modal} from '@web3modal/ethers/dist/types/src/client'
import {createWeb3Modal, defaultConfig} from '@web3modal/ethers/react'
import {CHAINS, METADATA, WALLET_CONNECT_PROJECT_ID} from "../config/wallectConnect"

export class WalletConnectModel {

    static walletConnectModel: WalletConnectModel
    static projectId = WALLET_CONNECT_PROJECT_ID
    static chainList = CHAINS
    static metadata = METADATA

    constructor(readonly modal: Web3Modal) {
    }

    static getInstance() {
        if (!WalletConnectModel.walletConnectModel) {
            const modal = createWeb3Modal({
                ethersConfig: defaultConfig({
                    metadata: WalletConnectModel.metadata
                }),
                chains: WalletConnectModel.chainList,
                projectId: WalletConnectModel.projectId
            })
            WalletConnectModel.walletConnectModel = new WalletConnectModel(modal)
        }
        return WalletConnectModel.walletConnectModel
    }

    async open() {
        return await this.modal.open()
    }

    async close() {
        return await this.modal.close()
    }

    async connect() {
        return await this.modal.open({view: 'Connect'})
    }

    getIsConnected() {
        return this.modal.getIsConnected()
    }

    getProvider() {
        return this.modal.getWalletProvider()
    }

    getAddress() {
        return this.modal.getAddress()
    }

    disconnect() {
        return this.modal.disconnect()
    }

}