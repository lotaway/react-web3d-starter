import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WalletName } from '../../../core/IWallet';

export interface ETHWalletInfo {
    walletName: WalletName;
    walletAddress: string;
    isConnected: boolean;
}

export interface UserStates {
    ethInfo: ETHWalletInfo;
    needBinding: boolean;
}

const initialState: UserStates = {
    ethInfo: {
        walletName: WalletName.NONE,
        walletAddress: '',
        isConnected: false,
    },
    needBinding: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateETHWalletInfo: (state, action: PayloadAction<ETHWalletInfo>) => {
            state.ethInfo = action.payload;
        },
        clearETHWalletInfo: (state) => {
            state.ethInfo = initialState.ethInfo;
        },
        updateNeedBinding: (state, action: PayloadAction<boolean>) => {
            state.needBinding = action.payload;
        },
    }
});

export const UserStoreModule = {
    slice: userSlice,
    actions: userSlice.actions,
};

export default userSlice.reducer;
