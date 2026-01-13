import { IWalletProvider } from "../../core/wallet/IWalletProvider";
import { WalletName } from "../../core/IWallet";
import EthersProvider from "./EthersProvider";
import { ethers } from "ethers";

export class MetaMaskProvider implements IWalletProvider {
    readonly name = WalletName.METAMASK;

    isInstalled(): boolean {
        return !!(window as any).ethereum;
    }

    async connect(): Promise<string[]> {
        if (!this.isInstalled()) {
            throw new Error("MetaMask is not installed");
        }
        const provider = EthersProvider.getInstance((window as any).ethereum);
        return await provider.connect();
    }

    async disconnect(): Promise<void> {
        return Promise.resolve();
    }

    async getAddress(): Promise<string | null> {
        if (!this.isInstalled()) return null;
        const provider = EthersProvider.getInstance((window as any).ethereum);
        const addresses = await provider.getWalletAddress();
        return addresses.length > 0 ? addresses[0] : null;
    }

    async getBalance(): Promise<string> {
        const address = await this.getAddress();
        if (!address) return "0";
        const provider = EthersProvider.getInstance((window as any).ethereum);
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    }

    async transfer(to: string, amount: string): Promise<string> {
        const provider = EthersProvider.getInstance((window as any).ethereum);
        const signer = await provider.getSigner();
        const tx = await signer.sendTransaction({
            to,
            value: ethers.parseEther(amount)
        });
        const receipt = await tx.wait();
        return receipt?.hash || "";
    }

    async signMessage(message: string): Promise<string> {
        const provider = EthersProvider.getInstance((window as any).ethereum);
        return await provider.getWalletSignature(message);
    }

    onAccountsChanged(callback: (accounts: string[]) => void): void {
        if ((window as any).ethereum) {
            (window as any).ethereum.on("accountsChanged", callback);
        }
    }

    removeAccountsChangedListener(): void {
    }
}
