import {ethers, BrowserProvider, Eip1193Provider, BigNumberish, Networkish} from "ethers"
import {getMessageByWalletAddress} from "../config/wallectConnect";
import IWebProvider from "../core/IWebProvider"

export default class EthersProvider implements IWebProvider {

    static ethersProvider: EthersProvider

    browserProvider: BrowserProvider

    private constructor(readonly walletProvider: Eip1193Provider, network?: Networkish) {
        this.browserProvider = new BrowserProvider(walletProvider, network)
    }

    static getInstance(walletProvider?: Eip1193Provider, network?: Networkish): EthersProvider {
        if (!EthersProvider.ethersProvider) {
            if (!walletProvider)
                throw new TypeError(`walletProvider not exist: ${walletProvider}`)
            EthersProvider.ethersProvider = new EthersProvider(walletProvider as Eip1193Provider, network)
        }
        return EthersProvider.ethersProvider
    }

    static ether2eth(etherVal: bigint | BigNumberish) {
        return ethers.formatEther(etherVal)
    }

    static eth2ether(ethVal: string) {
        return ethers.parseEther(ethVal)
    }

    async switchToChain(chainId: number) {
        return await this.browserProvider.send("wallet_switchEthereumChain", [{chainId: `0x${chainId.toString(16)}`}])
    }

    async addChain(chainId: number) {
        return await this.browserProvider.send("wallet_addEthereumChain", [
            {
                chainId: `0x${chainId.toString(16)}`
            }
        ])
    }

    async connect() {
        return await this.browserProvider.send("eth_requestAccounts", [])
    }

    async getWalletDefaultAddress() {
        const accounts = await this.connect()
        return accounts[0]
    }

    // 读取钱包地址
    async getWalletAddress() {
        return await this.browserProvider.send("eth_accounts", [])
    }

    async getBalance(walletAddress: string) {
        return await this.browserProvider.getBalance(walletAddress)
    }

    async getSigner() {
        return await this.browserProvider.getSigner()
    }

    // 获取钱包签名
    async getWalletSignature(message: string) {
        const signer = await this.getSigner()
        return await signer.signMessage(message)
    }

    static getTimestamp() {
        return +new Date()
    }

    // 只可监听以太坊
    async addAccountsChangedListener(callback: (accounts: string[]) => void) {
        return await this.browserProvider.on("accountsChanged", callback)
    }

    disconnect() {
        return Promise.reject(new Error("Please use wallet connect modal to disconnect"))
    }

}