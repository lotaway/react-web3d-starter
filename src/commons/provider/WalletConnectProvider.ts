import { Web3Modal } from '@web3modal/ethers/dist/types/src/client';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { CHAINS, getMainNet, METADATA, WALLET_CONNECT_PROJECT_ID } from "../../config/wallectConnect";
import { IWalletProvider } from "../../core/wallet/IWalletProvider";
import { WalletName } from "../../core/IWallet";
import EthersProvider from "./EthersProvider";
import { ethers } from "ethers";

export class WalletConnectProvider implements IWalletProvider {
    readonly name = WalletName.WALLETCONNECT;

    private static instance: WalletConnectProvider;
    private static projectId = WALLET_CONNECT_PROJECT_ID;
    private static metadata = METADATA;

    private modal: Web3Modal;
    private accountsChangedListener = (accounts: string[]) => { };

    private constructor() {
        this.modal = createWeb3Modal({
            ethersConfig: defaultConfig({
                metadata: WalletConnectProvider.metadata
            }),
            chains: CHAINS,
            defaultChain: getMainNet(),
            projectId: WalletConnectProvider.projectId
        });
    }

    static getInstance(): WalletConnectProvider {
        if (!WalletConnectProvider.instance) {
            WalletConnectProvider.instance = new WalletConnectProvider();
        }
        return WalletConnectProvider.instance;
    }

    isInstalled(): boolean {
        return true; // WalletConnect is a protocol, always "installed"
    }

    async connect(): Promise<string[]> {
        await this.modal.open({ view: 'Connect' });
        if (this.modal.getIsConnected()) {
            const address = this.modal.getAddress();
            return address ? [address] : [];
        }
        return [];
    }

    async disconnect(): Promise<void> {
        await this.modal.disconnect();
    }

    async getAddress(): Promise<string | null> {
        return this.modal.getAddress() || null;
    }

    async getBalance(): Promise<string> {
        const address = await this.getAddress();
        if (!address) return "0";
        const walletProvider = this.modal.getWalletProvider();
        if (!walletProvider) return "0";

        const provider = EthersProvider.getInstance(walletProvider as any);
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    }

    async transfer(to: string, amount: string): Promise<string> {
        const walletProvider = this.modal.getWalletProvider();
        if (!walletProvider) throw new Error("Wallet not connected");

        const provider = EthersProvider.getInstance(walletProvider as any);
        const signer = await provider.getSigner();
        const tx = await signer.sendTransaction({
            to,
            value: ethers.parseEther(amount)
        });
        const receipt = await tx.wait();
        return receipt?.hash || "";
    }

    async signMessage(message: string): Promise<string> {
        const walletProvider = this.modal.getWalletProvider();
        if (!walletProvider) throw new Error("Wallet not connected");

        const provider = EthersProvider.getInstance(walletProvider as any);
        return await provider.getWalletSignature(message);
    }

    onAccountsChanged(callback: (accounts: string[]) => void): void {
        this.accountsChangedListener = callback;
        const walletProvider = this.modal.getWalletProvider();
        // @ts-ignore
        walletProvider?.on('accountsChanged', this.accountsChangedListener);
    }

    removeAccountsChangedListener(): void {
        const walletProvider = this.modal.getWalletProvider();
        // @ts-ignore
        walletProvider?.removeListener('accountsChanged', this.accountsChangedListener);
    }

    // Helper methods from original WalletConnectModel if needed
    async open() {
        return await this.modal.open();
    }

    async close() {
        return await this.modal.close();
    }

    getState() {
        return this.modal.getState();
    }

    getChainId() {
        return this.modal.getChainId();
    }
}
