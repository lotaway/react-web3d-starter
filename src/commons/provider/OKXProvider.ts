import { IWalletProvider } from "../../core/wallet/IWalletProvider"
import { WalletName } from "../../core/IWallet"
import { Eip1193Provider } from "ethers"

export enum OKXNetwork {

}

enum OKXErrorCode {
    NO_SUCH_NETWORK = 4902,
}

class OKXError extends Error {
    constructor(readonly code: OKXErrorCode, readonly message: string) {
        super(message)
    }
}

// 官方文档：https://www.okx.com/cn/web3/build/docs/sdks/web-detect-okx-wallet
export class OKXProvider implements IWalletProvider {
    readonly name = WalletName.OKX;

    readonly wallet: OKXWalletBitcoin.WindowOKXWallet
    accounts: Array<string>
    bitCoinAccounts: Array<string>
    static okxProvider: OKXProvider
    static minAmount = 0.00001
    private accountsChangedListener = (accounts: string[]) => {
    }
    private accountsChangedListenerInBitCoin = (accounts: string[]) => {
    }

    private constructor() {
        if (!OKXProvider.isInstalled()) {
            throw new Error("OKX not installed")
        }
        this.wallet = OKXProvider.getOKXWallet() as OKXWalletBitcoin.WindowOKXWallet
        this.accounts = []
        this.bitCoinAccounts = []
    }

    static getOKXWallet() {
        return window.okxwallet
    }

    static isInstalled() {
        return typeof OKXProvider.getOKXWallet() !== 'undefined'
    }

    isInstalled(): boolean {
        return OKXProvider.isInstalled()
    }

    static getInstance() {
        if (!OKXProvider.okxProvider) {
            OKXProvider.okxProvider = new OKXProvider()
        }
        return OKXProvider.okxProvider
    }

    async connect(network?: OKXNetwork): Promise<string[]> {
        this.accounts = await this.wallet.request({ method: 'eth_requestAccounts' })
        return this.accounts
    }

    async connectToBitcoin(): Promise<NSBitcoin.AccountInfo> {
        return await this.wallet.bitcoin.connect()
    }

    async disconnect() {
        return Promise.resolve()
    }

    async getWalletAddress() {
        this.accounts = await this.wallet.request({ method: 'eth_accounts' })
        return this.accounts
    }

    async getWalletAddressFromBitcoin() {
        this.bitCoinAccounts = await this.wallet.bitcoin.requestAccounts()
        // await this.wallet.bitcoin.requestAccounts()
        return this.bitCoinAccounts
    }

    async getAddress() {
        if (this.accounts.length) {
            return this.accounts[0]
        }
        await this.getWalletAddress()
        return this.accounts[0] || null
    }

    async getWalletDefaultAddress() {
        return await this.getAddress()
    }

    async getWalletDefaultAddressFromBitcoin() {
        if (this.bitCoinAccounts.length) {
            return this.bitCoinAccounts[0]
        }
        await this.getWalletAddressFromBitcoin()
        return this.bitCoinAccounts[0]
    }

    /*async getNetwork() {
         return await this.wallet.getNetwork()
     }*/

    async getNetworkFromBitcoin() {
        return await this.wallet.bitcoin.getNetwork()
    }

    async addNetwork(networks: Array<{ chainId: string, chainName: string, rpcUrl: string }>) {
        return await this.wallet.request({
            method: 'wallet_addEthereumChain',
            params: networks,
        })
    }

    async switchNetwork(chainId: string, chainName?: string) {
        // try {
        await this.wallet.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
        })
        /* } catch (switchError: OKXError | unknown) {
             // This error code indicates that the chain has not been added to OKX.
             if (typeof switchError === "object" && (switchError as OKXError).code === OKXErrorCode.NO_SUCH_NETWORK) {
                 await this.addNetwork([
                     {
                         chainId,
                         chainName: chainName ?? "okx-" + new Date(),
                         rpcUrl: ""
                     }
                 ])
             } else throw switchError
         }*/
    }

    /*async getPublicKey() {
        return await this.wallet.getPublicKey()
    }*/

    async getPublicKeyFromBitcoin() {
        return await this.wallet.bitcoin.getPublicKey()
    }

    async signMessage(message: string, walletAddress?: string): Promise<string> {
        return await this.wallet
            .request({
                method: 'eth_sign',
                params: [walletAddress ?? this.accounts[0], message],
            })
    }

    async signMessageInBitcoin(message: string) {
        return await this.wallet.bitcoin.signMessage(message)
    }

    async getWalletSignature(message: string) {
        return await this.signMessage(message)
    }

    async getWalletSignatureFromBitcoin(message: string) {
        return await this.signMessageInBitcoin(message)
    }

    onAccountsChanged(callback: (accounts: string[]) => void): void {
        this.addAccountsChangedListener(callback)
    }

    addAccountsChangedListener(callback: typeof this.accountsChangedListener) {
        this.accountsChangedListener = callback
        return this.wallet.on('accountsChanged', this.accountsChangedListener)
    }

    addAccountsChangedListenerInBitcoin(callback: typeof this.accountsChangedListener) {
        this.accountsChangedListenerInBitCoin = callback
        return this.wallet.bitcoin.on('accountsChanged', this.accountsChangedListenerInBitCoin)
    }

    removeAccountsChangedListener() {
        const result = this.wallet.removeListener('accountsChanged', this.accountsChangedListener)
        this.accountsChangedListener = () => {
        }
        return result
    }

    removeAccountsChangedListenerInBitcoin() {
        const result = this.wallet.bitcoin.removeListener('accountsChanged', this.accountsChangedListenerInBitCoin)
        this.accountsChangedListenerInBitCoin = () => {
        }
        return result
    }

    async getBalance(): Promise<string> {
        const result = await this.wallet.request({
            method: "getBalance",
        })
        return String(result)
    }

    async getBalanceFromBitcoin() {
        return await this.wallet.bitcoin.getBalance()
    }

    async transfer(to: string, amount: string): Promise<string> {
        return await this.transferTo(to, amount)
    }

    async transferTo(to: string, satoshis: string, from?: string) {
        return await this.wallet.request({
            method: 'eth_sendTransaction',
            params: [
                {
                    from: from ?? this.accounts?.[0] ?? await this.getWalletDefaultAddress(),
                    to: to,
                    value: satoshis,
                },
            ]
        })
    }

    async transferToFromBitcoin(to: string, satoshis: NSBitcoin.Satoshis) {
        return await this.wallet.bitcoin.sendBitcoin(to, satoshis)
    }
}