import {initializeConnector} from '@web3-react/core'
import {WalletConnect as WalletConnectV2} from '@web3-react/walletconnect-v2'
import {onConnectionError, Connection} from './connections'
import {CHAIN_ID} from "@/components/Wallet/constants";

export function buildWalletConnector(): Connection {
    const [connector, hooks] = initializeConnector<WalletConnectV2>(
        (actions) =>
            new WalletConnectV2({
                actions,
                defaultChainId: CHAIN_ID.BSC,
                options: {
                    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
                    chains: [CHAIN_ID.BSC],
                    showQrModal: true,
                },
            }),
    )

    return {
        connector,
        hooks,
    }
}
