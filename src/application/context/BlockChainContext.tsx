import React, { createContext, ReactNode, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../repository/store/hooks";
import { WalletName } from "../../core/IWallet";
import UserStoreModule from "../../repository/store/modules/user";
import { WalletFactory } from "../../core/wallet/WalletFactory";
import { toast } from "react-hot-toast";
import Logger from "../../commons/utils/Logger";

export interface IBlockchainContext {
    currentWallet: WalletName;
    walletAddress: string;
    isConnected: boolean;
    balance: string;
    connectWallet: (name: WalletName) => Promise<string[]>;
    disconnectWallet: () => Promise<void>;
    deposit: (amount: string, targetAddress: string) => Promise<string>;
    withdraw: (amount: string, targetAddress: string) => Promise<string>;
    updateBalance: () => Promise<void>;
}

export const BlockChainContext = createContext<IBlockchainContext | undefined>(undefined);

export const BlockchainProvider = ({ children }: { children: ReactNode }) => {
    const dispatch = useAppDispatch();
    const ethInfo = useAppSelector((state) => state.user.ethInfo);
    
    const currentProvider = useMemo(() => {
        if (ethInfo.walletName !== WalletName.NONE) {
            try {
                return WalletFactory.getProvider(ethInfo.walletName);
            } catch (e) {
                Logger.E("Failed to get provider", e);
            }
        }
        return null;
    }, [ethInfo.walletName]);

    const updateBalance = useCallback(async () => {
        if (!currentProvider || !ethInfo.isConnected) return;
        try {
            const balance = await currentProvider.getBalance();
            // Assuming we might want to store balance in Redux later
            // For now just logging or we could add a state here
            Logger.D("Balance updated:", balance);
        } catch (e) {
            Logger.E("Failed to update balance", e);
        }
    }, [currentProvider, ethInfo.isConnected]);

    const handleAccountsChanged = useCallback((accounts: string[]) => {
        if (accounts.length > 0) {
            dispatch(UserStoreModule.slice.actions.updateETHWalletInfo({
                ...ethInfo,
                walletAddress: accounts[0],
                isConnected: true,
            }));
            void updateBalance();
        } else {
            dispatch(UserStoreModule.slice.actions.clearETHWalletInfo());
        }
    }, [dispatch, ethInfo, updateBalance]);

    const connectWallet = useCallback(async (name: WalletName) => {
        const provider = WalletFactory.getProvider(name);
        if (!provider.isInstalled()) {
            const error = `${WalletName[name]} is not installed!`;
            toast.error(error);
            throw new Error(error);
        }

        try {
            const accounts = await provider.connect();
            dispatch(UserStoreModule.slice.actions.updateETHWalletInfo({
                walletName: name,
                walletAddress: accounts[0] || "",
                isConnected: accounts.length > 0,
            }));
            
            provider.onAccountsChanged(handleAccountsChanged);
            void updateBalance();
            return accounts;
        } catch (e: any) {
            toast.error(e.message || "Connection failed");
            throw e;
        }
    }, [dispatch, handleAccountsChanged, updateBalance]);

    const disconnectWallet = useCallback(async () => {
        if (currentProvider) {
            await currentProvider.disconnect();
            currentProvider.removeAccountsChangedListener();
        }
        dispatch(UserStoreModule.slice.actions.clearETHWalletInfo());
    }, [currentProvider, dispatch]);

    const deposit = useCallback(async (amount: string, targetAddress: string) => {
        if (!currentProvider) throw new Error("No wallet connected");
        return await currentProvider.transfer(targetAddress, amount);
    }, [currentProvider]);

    const withdraw = useCallback(async (amount: string, targetAddress: string) => {
        // In many cases deposit/withdraw are just transfers between certain addresses
        if (!currentProvider) throw new Error("No wallet connected");
        return await currentProvider.transfer(targetAddress, amount);
    }, [currentProvider]);

    // Initial listener setup if already connected
    useEffect(() => {
        if (currentProvider && ethInfo.isConnected) {
            currentProvider.onAccountsChanged(handleAccountsChanged);
        }
        return () => {
            currentProvider?.removeAccountsChangedListener();
        };
    }, [currentProvider, ethInfo.isConnected, handleAccountsChanged]);

    const contextValue: IBlockchainContext = {
        currentWallet: ethInfo.walletName,
        walletAddress: ethInfo.walletAddress,
        isConnected: ethInfo.isConnected,
        balance: "0", // Should be managed by a state if needed
        connectWallet,
        disconnectWallet,
        deposit,
        withdraw,
        updateBalance,
    };

    return (
        <BlockChainContext.Provider value={contextValue}>
            {children}
        </BlockChainContext.Provider>
    );
};