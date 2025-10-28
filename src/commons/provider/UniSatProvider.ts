// import {verifyMessage} from "@unisat/wallet-utils/lib"
import IWebProvider from "../core/IWebProvider"
import {BitcoinNetwork} from "../core/IWallet"

// 官方文档：https://docs.unisat.io/dev/unisat-developer-service/unisat-wallet
// 第三方示例：https://blog.csdn.net/qq_45032714/article/details/131610569
export class UniSatProvider implements IWebProvider {

    accounts: Array<string>
    static uniSatProvider: UniSatProvider
    static minAmount = 0.00001
    private accountsChangedListener = (accounts: string[]) => {
    }

    private constructor() {
        this.accounts = []
    }

    static getUniSat() {
        return window.unisat
    }

    static isInstalled() {
        return typeof UniSatProvider.getUniSat() !== 'undefined'
    }

    static getInstance() {
        if (!UniSatProvider.uniSatProvider) {
            UniSatProvider.uniSatProvider = new UniSatProvider()
        }
        return UniSatProvider.uniSatProvider
    }

    static btc2Satoshis(amount: number): NSBitcoin.Satoshis {
        return amount * Math.pow(10, 8)
    }

    static satoshis2Btc(satoshis: number): number {
        return satoshis / Math.pow(10, 8)
    }

    static checkAmount(amount: number) {
        return amount >= UniSatProvider.minAmount
    }

    static checkSatoshis(satoshis: number) {
        return UniSatProvider.checkAmount(UniSatProvider.satoshis2Btc(satoshis))
    }

    // Connect the current account
    async connect(network?: BitcoinNetwork) {
        /*if (network) {
            this.switchNetwork(network)
        }*/
        const selectedNetwork = await UniSatProvider.getUniSat()!.getNetwork()
        this.accounts = await UniSatProvider.getUniSat()!.requestAccounts()
        return this.accounts
    }

    async disconnect() {
        return Promise.resolve()
    }

    // Get address of current account
    async getWalletAddress() {
        this.accounts = await UniSatProvider.getUniSat()!.getAccounts()
        return this.accounts
    }

    async getWalletDefaultAddress() {
        if (this.accounts.length) {
            return this.accounts[0]
        }
        await this.getWalletAddress()
        return this.accounts[0]
    }

    async getNetwork() {
        return await UniSatProvider.getUniSat()!.getNetwork()
    }

    switchNetwork(network: string) {
        return UniSatProvider.getUniSat()!.switchNetwork(network)
    }

    switchToLiveNetwork() {
        return this.switchNetwork(BitcoinNetwork.Livenet)
    }

    async getPublicKey() {
        return await UniSatProvider.getUniSat()!.getPublicKey()
    }

    async signMessage(message: string) {
        return await UniSatProvider.getUniSat()!.signMessage(message);
    }

    async getWalletSignature(message: string) {
        return await this.signMessage(message)
    }

    /*async testSignMessage() {
        // sign by ecdsa
        try {
            let res = await UniSatProvider.getUniSat()!.signMessage("abcdefghijk123456789");
            console.log(res)
        } catch (e) {
            console.log(e);
        }

        // > G+LrYa7T5dUMDgQduAErw+i6ebK4GqTXYVWIDM+snYk7Yc6LdPitmaqM6j+iJOeID1CsMXOJFpVopvPiHBdulkE=

// verify by ecdsa
        const pubkey = "026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac";
        const message = "abcdefghijk123456789";
        const signature = "G+LrYa7T5dUMDgQduAErw+i6ebK4GqTXYVWIDM+snYk7Yc6LdPitmaqM6j+iJOeID1CsMXOJFpVopvPiHBdulkE=";
        const result = verifyMessage(pubkey, message, signature);
        console.log(result);

        // > true


// sign by bip322-simple
        try {
            let res = await UniSatProvider.getUniSat()!.signMessage("abcdefghijk123456789", "bip322-simple");
            console.log(res)
        } catch (e) {
            console.log(e);
        }

        // > AkcwRAIgeHUcjr0jODaR7GMM8cenWnIj0MYdGmmrpGyMoryNSkgCICzVXWrLIKKp5cFtaCTErY7FGNXTFe6kuEofl4G+Vi5wASECaIeVi8xMtvjATqSSYPDRDjEsQbr0hSUpU7FHJNtVKqw=
    }*/

    addAccountsChangedListener(callback: typeof this.accountsChangedListener) {
        this.accountsChangedListener = callback
        return UniSatProvider.getUniSat()!.on('accountsChanged', this.accountsChangedListener)
    }

    removeAccountsChangedListener() {
        const result = UniSatProvider.getUniSat()!.removeListener('accountsChanged', this.accountsChangedListener)
        this.accountsChangedListener = () => {
        }
        return result
    }

    async getBalance() {
        return await UniSatProvider.getUniSat()!.getBalance()
    }

    async transferTo(to: string, satoshis: NSBitcoin.Satoshis) {
        if (!UniSatProvider.checkSatoshis(satoshis)) {
            throw new Error(`Amount must be at least ${UniSatProvider.minAmount} BTC, but got ${satoshis} satoshis`)
        }
        return await UniSatProvider.getUniSat()!.sendBitcoin(to, satoshis)
    }
}