import { WalletName } from "../IWallet";

export interface WalletAccount {
    address: string;
    publicKey?: string;
}

export interface IWalletProvider {
    readonly name: WalletName;

    /**
     * Connect to the wallet
     * @returns List of connected account addresses
     */
    connect(): Promise<string[]>;

    /**
     * Disconnect from the wallet
     */
    disconnect(): Promise<void>;

    /**
     * Check if the wallet extension is installed
     */
    isInstalled(): boolean;

    /**
     * Get the default account address
     */
    getAddress(): Promise<string | null>;

    /**
     * Get the current balance of the wallet
     */
    getBalance(): Promise<string>;

    /**
     * Send a transaction (Deposit/Withdraw)
     * @param to Target address
     * @param amount Amount to send in smallest unit (e.g. Wei, Satoshis, Lamports)
     */
    transfer(to: string, amount: string): Promise<string>;

    /**
     * Sign a message
     */
    signMessage(message: string): Promise<string>;

    /**
     * Listen for account changes
     */
    onAccountsChanged(callback: (accounts: string[]) => void): void;

    /**
     * Remove account change listener
     */
    removeAccountsChangedListener(): void;
}
