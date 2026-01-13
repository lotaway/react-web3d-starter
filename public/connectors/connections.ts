import {Connector} from '@web3-react/types'
import {Web3ReactHooks} from '@web3-react/core'

import {buildInjectedConnector, buildTokenPocketConnector} from './injected'
import {buildWalletConnector} from './wallet-connect'
import {buildCloverConnector} from './clover'

import {StaticImageData} from 'next/image'

import ImgUnisat from '../images/Unisat.png'
import ImgOKX from '../images/OKX.png'
import ImgMetaMask from '../images/MetaMask.png'
import ImgTokenPocket from '../images/TokenPocket.png'
import ImgWalletConnect from '../images/WalletConnect.png'
import {isSupportChainId} from "@/components/Wallet/eth";
import {CHAIN_ID} from "@/components/Wallet/constants";

export function onConnectionError(error: Error) {
    // console.log('----------onConnectionError', error)
    // console.debug(`web3-react error: ${error}`)
}

export interface Connection {
    connector: Connector
    hooks: Web3ReactHooks
}

export enum BtcConnectionType {
    UNISAT = 'UNISAT',
    OKX = 'OKX',
}

export enum EthConnectionType {
    METAMASK = 'METAMASK',
    TOKENPOCKET = 'TOKENPOCKET',
    OKX = 'OKX',
    WALLETCONNECT = 'WALLETCONNECT',
    CLOVER = 'CLOVER',
}

export enum SolanaConnectionType {
    PHANTOM,
}

export const CONNECTORS: {
    [key: string]: Connection
} = {
    [EthConnectionType.METAMASK]: buildInjectedConnector(true),
    [EthConnectionType.TOKENPOCKET]: buildTokenPocketConnector(),
    [EthConnectionType.OKX]: buildInjectedConnector(),
    [EthConnectionType.WALLETCONNECT]: buildWalletConnector(),
    [EthConnectionType.CLOVER]: buildCloverConnector(),
}

export interface EthWallet {
    icon: string | StaticImageData
    name: string
    type: EthConnectionType
    isInstalled: () => boolean
}

export interface BtcWallet {
    icon: string | StaticImageData
    name: string
    type: BtcConnectionType
    isInstalled: () => boolean
}

// add solana wallet connect handle in other place
export interface SolanaWallet {
    icon: string | StaticImageData
    name: string
    type: SolanaConnectionType
    isInstalled: () => boolean
}

export const ETH_WALLETS: EthWallet[] = [
    {
        icon: ImgMetaMask,
        name: 'MetaMask',
        type: EthConnectionType.METAMASK,
        isInstalled: () => {
            const ethereum: any = window.ethereum || {}
            const providers = ethereum.providers || []

            return !!(
                providers.find(
                    (_provider: any) =>
                        _provider.isMetaMask &&
                        !_provider.isBitKeep &&
                        !_provider.isTokenPocket &&
                        !_provider.isOkxWallet,
                ) ||
                (ethereum.isMetaMask && !ethereum.isBitKeep && !ethereum.isTokenPocket && !ethereum.isOkxWallet)
            )
        },
    },
    {
        icon: ImgTokenPocket,
        name: 'TokenPocket',
        type: EthConnectionType.TOKENPOCKET,
        isInstalled: () => {
            // alert(`${JSON.stringify(window.tokenpocket?.solana)},${JSON.stringify(window.tokenpocket?.ethereum)}`)
            const ethereum: any = window.ethereum || {}
            const providers = ethereum.providers || []
            return !!(
                providers.find((_provider: any) => _provider.isTokenPocket)
                || ethereum.isTokenPocket
                || (window.tokenpocket?.ethereum)
            )
        },
    },
    {
        icon: ImgOKX,
        name: 'OKX',
        type: EthConnectionType.OKX,
        isInstalled: () => {
            const ethereum: any = window.ethereum || {}
            const providers = ethereum.providers || []

            return !!(
                providers.find((_provider: any) => _provider.isOkxWallet) ||
                (window as any)?.okxwallet?.isOkxWallet
            )
        },
    },
    {
        icon: ImgWalletConnect,
        name: 'WalletConnect',
        type: EthConnectionType.WALLETCONNECT,
        isInstalled: () => true,
    },
]

export const BTC_WALLETS: BtcWallet[] = [
    {
        icon: ImgUnisat,
        name: 'UniSat',
        type: BtcConnectionType.UNISAT,
        isInstalled: () => {
            if (typeof window === 'undefined') {
                return false
            }

            if (typeof (window as any).unisat === 'undefined') {
                window.open('https://unisat.io/download')
                return false
            }

            return true
        },
    },
    {
        icon: ImgOKX,
        name: 'OKX',
        type: BtcConnectionType.OKX,
        isInstalled: () => {
            if (typeof window === 'undefined') {
                return false
            }

            if (typeof (window as any).okxwallet === 'undefined') {
                if (!!window.navigator.userAgent.match(/Mobile|Android|iPhone|iPad/)) {
                    window.open(
                        `okx://wallet/dapp/details?dappUrl=${encodeURIComponent(
                            window.location.href,
                        )}`,
                    )
                } else {
                    window.open('https://www.okx.com/cn/web3')
                }

                return false
            }

            return true
        },
    },
]

export function switchChain(connector?: Connector, chainId?: number) {
    if (!connector || !chainId) return

    if (!isSupportChainId(chainId)) {
        return connector.activate(CHAIN_ID.BSC)
    }

    // if (process.env.NEXT_PUBLIC_ENV === 'PRODUCTION') {
    //   if (chainId !== 1) {
    //     return connector.activate(1)
    //   }
    // } else {
    //   if (chainId !== 5) {
    //     return connector.activate(5)
    //     // {
    //     //   chainId: 5,
    //     //   chainName: 'Goerli 测试网络',
    //     //   nativeCurrency: {
    //     //     name: 'Goerli',
    //     //     symbol: 'GoerliETH',
    //     //     decimals: 18,
    //     //   },
    //     //   rpcUrls: [
    //     //     'https://goerli.infura.io/v3/',
    //     //     'https://eth-goerli.public.blastapi.io',
    //     //   ],
    //     //   blockExplorerUrls: ['https://goerli.etherscan.io'],
    //     // }
    //   }
    // }
}

export function getConnection(c: Connector | EthConnectionType) {
    let connection
    if (c instanceof Connector) {
        connection = Object.values(CONNECTORS).find(
            (connection) => connection.connector === c,
        )
    } else {
        connection = CONNECTORS[c]
    }
    return connection
}

export const tryActivateConnector = async (
    connector: Connector,
    isEagerly?: boolean,
) => {
    const result: [Connector | undefined, Error | undefined] = [undefined, undefined]
    try {
        if (isEagerly && connector.connectEagerly) {
            await connector.connectEagerly()
        } else {
            await connector.activate()
        }
        result[0] = connector
    } catch (err) {
        result[1] = err as Error
    }
    return result
}

export const tryDeactivateConnector = async (connector: Connector) => {
    const result = []
    try {
        connector.deactivate?.()
        connector.resetState()
        result[0] = connector
    } catch (err) {
        result[1] = err
    }
    return result
}
