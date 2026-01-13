import { initializeConnector } from '@web3-react/core'
import { onConnectionError, Connection } from './connections'
import type {
  Actions,
  AddEthereumChainParameter,
  Provider,
  ProviderConnectInfo,
  ProviderRpcError,
  WatchAssetParameters,
} from '@web3-react/types'
import { Connector } from '@web3-react/types'

export function buildCloverConnector(): Connection {
  const [connector, hooks] = initializeConnector<Clover>(
    (actions) => new Clover({ actions, onError: onConnectionError }),
  )
  return {
    connector,
    hooks,
  }
}

interface CloverProvider extends Provider {
  isClover?: boolean
  isConnected?: () => boolean
  providers?: CloverProvider[]
  get chainId(): string
  get accounts(): string[]
  once(eventName: string | symbol, listener: (...args: any[]) => void): this
  on(eventName: string | symbol, listener: (...args: any[]) => void): this
  off(eventName: string | symbol, listener: (...args: any[]) => void): this
  addListener(
    eventName: string | symbol,
    listener: (...args: any[]) => void,
  ): this
  removeListener(
    eventName: string | symbol,
    listener: (...args: any[]) => void,
  ): this
  removeAllListeners(event?: string | symbol): this
}

export class NoCloverError extends Error {
  public constructor() {
    super('Clover not installed')
    this.name = NoCloverError.name
    Object.setPrototypeOf(this, NoCloverError.prototype)
  }
}

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

/**
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface MetaMaskConstructorArgs {
  actions: Actions
  options?: any
  onError?: (error: Error) => void
}

export class Clover extends Connector {
  /** {@inheritdoc Connector.provider} */
  declare public provider?: CloverProvider

  private readonly options?: any
  private eagerConnection?: Promise<void>

  constructor({ actions, options, onError }: MetaMaskConstructorArgs) {
    super(actions, onError)
    this.options = options
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return

    return (this.eagerConnection = Promise.resolve(
      (window as any)?.clover,
    ).then(async (provider) => {
      if (provider) {
        this.provider = provider as CloverProvider

        // handle the case when e.g. metamask and coinbase wallet are both installed
        if (this.provider.providers?.length) {
          this.provider =
            this.provider.providers.find((p) => p.isClover) ??
            this.provider.providers[0]
        }

        this.provider.on(
          'connect',
          ({ chainId }: ProviderConnectInfo): void => {
            this.actions.update({ chainId: parseChainId(chainId) })
          },
        )

        this.provider.on('disconnect', (error: ProviderRpcError): void => {
          this.actions.resetState()
          this.onError?.(error)
        })

        this.provider.on('chainChanged', (chainId: string): void => {
          this.actions.update({ chainId: parseChainId(chainId) })
        })

        this.provider.on('accountsChanged', (accounts: string[]): void => {
          if (accounts.length === 0) {
            // handle this edge case by disconnecting
            this.actions.resetState()
          } else {
            this.actions.update({ accounts })
          }
        })
      }
    }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    try {
      await this.isomorphicInitialize()
      if (!this.provider) return cancelActivation()

      // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
      // chains; they should be requested serially, with accounts first, so that the chainId can settle.
      const accounts = (await this.provider.request({
        method: 'eth_accounts',
      })) as string[]
      if (!accounts.length) throw new Error('No accounts returned')
      const chainId = (await this.provider.request({
        method: 'eth_chainId',
      })) as string
      this.actions.update({ chainId: parseChainId(chainId), accounts })
    } catch (error) {
      console.debug('Could not connect eagerly', error)
      // we should be able to use `cancelActivation` here, but on mobile, metamask emits a 'connect'
      // event, meaning that chainId is updated, and cancelActivation doesn't work because an intermediary
      // update has occurred, so we reset state instead
      this.actions.resetState()
    }
  }

  /**
   * Initiates a connection.
   *
   * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
   * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
   * to the chain, if one of two conditions is met: either they already have it added in their extension, or the
   * argument is of type AddEthereumChainParameter, in which case the user will be prompted to add the chain with the
   * specified parameters first, before being prompted to switch.
   */
  public async activate(
    desiredChainIdOrChainParameters?: number | AddEthereumChainParameter,
  ): Promise<void> {
    let cancelActivation: () => void
    if (!this.provider?.isConnected?.())
      cancelActivation = this.actions.startActivation()

    return this.isomorphicInitialize()
      .then(async () => {
        if (!this.provider) throw new NoCloverError()

        // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
        // chains; they should be requested serially, with accounts first, so that the chainId can settle.
        const accounts = (await this.provider.request({
          method: 'eth_requestAccounts',
        })) as string[]
        const chainId = (await this.provider.request({
          method: 'eth_chainId',
        })) as string
        const receivedChainId = parseChainId(chainId)
        const desiredChainId =
          typeof desiredChainIdOrChainParameters === 'number'
            ? desiredChainIdOrChainParameters
            : desiredChainIdOrChainParameters?.chainId

        // if there's no desired chain, or it's equal to the received, update
        if (!desiredChainId || receivedChainId === desiredChainId)
          return this.actions.update({ chainId: receivedChainId, accounts })

        const desiredChainIdHex = `0x${desiredChainId.toString(16)}`

        // if we're here, we can try to switch networks
        return this.provider
          .request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: desiredChainIdHex }],
          })
          .catch((error: ProviderRpcError) => {
            // https://github.com/MetaMask/metamask-mobile/issues/3312#issuecomment-1065923294
            const errorCode =
              (error.data as any)?.originalError?.code || error.code

            // 4902 indicates that the chain has not been added to MetaMask and wallet_addEthereumChain needs to be called
            // https://docs.metamask.io/guide/rpc-api.html#wallet-switchethereumchain
            if (
              errorCode === 4902 &&
              typeof desiredChainIdOrChainParameters !== 'number'
            ) {
              if (!this.provider) throw new Error('No provider')
              // if we're here, we can try to add a new network
              return this.provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    ...desiredChainIdOrChainParameters,
                    chainId: desiredChainIdHex,
                  },
                ],
              })
            }

            throw error
          })
          .then(() => this.activate(desiredChainId))
      })
      .catch((error) => {
        cancelActivation?.()
        throw error
      })
  }

  public async watchAsset({
    address,
    symbol,
    decimals,
    image,
  }: WatchAssetParameters): Promise<true> {
    if (!this.provider) throw new Error('No provider')

    return this.provider
      .request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address, // The address that the token is at.
            symbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals, // The number of decimals in the token
            image, // A string url of the token logo
          },
        },
      })
      .then((success) => {
        if (!success) throw new Error('Rejected')
        return true
      })
  }
}
