import {Web3Modal} from '@web3modal/ethers/dist/types/src/client'
import {createWeb3Modal, defaultConfig} from '@web3modal/ethers/react'
import {CHAINS, getMainNet, METADATA, WALLET_CONNECT_PROJECT_ID} from "../config/wallectConnect"

export class WalletConnectModel {

    static walletConnectModel: WalletConnectModel
    // 1. Get projectId at https://cloud.walletconnect.com
    static projectId = WALLET_CONNECT_PROJECT_ID
    static metadata = METADATA

    private accountsChangedListener = (accounts: string[]) => {}

    private constructor(readonly modal: Web3Modal) {
    }

    static getInstance() {
        if (!WalletConnectModel.walletConnectModel) {
            const modal = createWeb3Modal({
                ethersConfig: defaultConfig({
                    metadata: WalletConnectModel.metadata
                }),
                chains: CHAINS,
                defaultChain: getMainNet(),
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

    async selectNetwork() {
        return await this.modal.open({view: 'Networks'})
    }

    getState() {
        return this.modal.getState()
    }

    getSelectedNetworkId() {
        return this.getState().selectedNetworkId
    }

    getChainId() {
        return this.modal.getChainId()
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

    // 监听账户切换事件
    addAccountsChangedListener(callback: typeof this.accountsChangedListener) {
        this.accountsChangedListener = callback
        // @ts-ignore
        return this.getProvider()?.on('accountsChanged', this.accountsChangedListener)
    }

}