import { IWalletProvider } from "../../core/wallet/IWalletProvider";
import { WalletName } from "../../core/IWallet";

export class SolflareProvider implements IWalletProvider {
    readonly name = WalletName.SOLFLARE;

    private getProvider() {
        if ("solflare" in window) {
            return (window as any).solflare;
        }
        return null;
    }

    isInstalled(): boolean {
        const provider = this.getProvider();
        return !!provider && provider.isSolflare;
    }

    async connect(): Promise<string[]> {
        const provider = this.getProvider();
        if (!provider) {
            throw new Error("Solflare is not installed");
        }
        await provider.connect();
        return [provider.publicKey.toString()];
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
        if (!provider) throw new Error("Solflare not connected");
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
