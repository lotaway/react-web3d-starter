import { IWalletProvider } from "../../core/wallet/IWalletProvider";
import { WalletName } from "../../core/IWallet";

export class PhantomProvider implements IWalletProvider {
    readonly name = WalletName.PHANTOM;

    private getProvider() {
        if ("phantom" in window) {
            const provider = (window as any).phantom?.solana;
            if (provider?.isPhantom) {
                return provider;
            }
        }
        return (window as any).solana;
    }

    isInstalled(): boolean {
        const provider = this.getProvider();
        return !!provider && provider.isPhantom;
    }

    async connect(): Promise<string[]> {
        const provider = this.getProvider();
        if (!provider) {
            throw new Error("Phantom is not installed");
        }
        const resp = await provider.connect();
        return [resp.publicKey.toString()];
    }

    async disconnect(): Promise<void> {
        const provider = this.getProvider();
        if (provider) {
            await provider.disconnect();
        }
    }

    async getAddress(): Promise<string | null> {
        const provider = this.getProvider();
        return provider?.publicKey?.toString() || null;
    }

    async getBalance(): Promise<string> {
        return "0";
    }

    async transfer(to: string, amount: string): Promise<string> {
        throw new Error("Solana transfer not implemented yet");
    }

    async signMessage(message: string): Promise<string> {
        const provider = this.getProvider();
        if (!provider) throw new Error("Phantom not connected");
        const encodedMessage = new TextEncoder().encode(message);
        const signedMessage = await provider.signMessage(encodedMessage, "utf8");
        return JSON.stringify(signedMessage);
    }

    onAccountsChanged(callback: (accounts: string[]) => void): void {
        const provider = this.getProvider();
        provider?.on("accountChanged", (publicKey: any) => {
            if (publicKey) {
                callback([publicKey.toString()]);
            } else {
                callback([]);
            }
        });
    }

    removeAccountsChangedListener(): void {
        const provider = this.getProvider();
        provider?.removeAllListeners("accountChanged");
    }
}
