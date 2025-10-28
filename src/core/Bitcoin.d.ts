declare namespace NSBitcoin {

    interface IBitcoin {
        connect: () => Promise<AccountInfo>
        // get network id
        getNetwork: () => Promise<string>
        getPublicKey: GetPublicKey
        requestAccounts: () => Promise<Array<string>>
        getBalance: GetBalance
        signMessage: SignMessage
        signPsbt: SignPsbt
        getInscriptions: GetInscriptions
        sendBitcoin: SendBitcoin
        pushPsbt: PushPsbt
        pushTx: PushTx
        on: OnEventFn
        removeListener: OnEventFn
        // Add more function declarations as per the API documentation
    }

    type SignMessage = (message: string, type?: "ecdsa" | "bip322-simple"/*default is "ecdsa"*/) => Promise<string>

    type Satoshis = number

// transaction ID
    type TXId = string

    interface AccountBalance {
        confirmed: Satoshis
        unconfirmed: Satoshis
        total: Satoshis
    }

    interface AccountInfo {
        address: string
        publicKey: string
    }

    interface Inscription {
        inscriptionId: string
        address: string
        outputValue: string
        location: string
        output: string
        offset: number
    }

    interface InscriptionsResponse {
        total: number
        list: Inscription[]
    }

// the hex string of psbt
    type PsbtHex = string

    interface ToSignInput {
        // The index of the input to sign.
        index: number

        // Address corresponding to the private key used for signing.
        // At least an address or a publicKey must be specified.
        address?: string

        // PublicKey corresponding to the private key used for signing.
        // At least an address or a publicKey must be specified.
        publicKey?: string

        // Optional array of sighash types.
        sighashTypes?: number[]
    }

    interface SignPsbtOptions {
        // Whether to finalize the PSBT after signing. Default is true.
        autoFinalized?: boolean

        // Array of inputs to sign.
        toSignInputs?: ToSignInput[]

        // Disable the tweakSigner when signing Taproot addresses.
        // By default, the tweakSigner is used for signature generation.
        // Setting this to true allows for signing with the original private key.
        // This is optional.
        disableTweakSigner?: boolean
    }

    type GetInscriptions = (cursor?: number, size?: number) => Promise<InscriptionsResponse>

    type GetBalance = () => Promise<AccountBalance>

    type GetPublicKey = () => Promise<string>
    type SendBitcoin = (toAddress: string, satoshis: NSBitcoin.Satoshis, options?: SendOptions) => Promise<TXId>

    type SignPsbt = (psbtHex: PsbtHex, options?: SignPsbtOptions) => Promise<string>

    type PushPsbt = (psbtHex: PsbtHex) => Promise<NSBitcoin.TXId>

    type PushTx = (options: { rawtx: string }) => Promise<NSBitcoin.TXId>
}

enum OnWeb3WalletEvent {
    AccountsChanged = 'accountsChanged',
    NetworkChanged = "networkChanged",
}

type OnEventHandler = (event: string, handler: (...params: any[]) => void) => void

type OnAccountsChangedHandler = (event: OnWeb3WalletEvent.AccountsChanged, handler: (accounts: Array<string>) => void) => void

type OnNetworkChangedHandler = (event: OnWeb3WalletEvent.NetworkChanged, handler: (network: string) => void) => void

type OnEventParameters = Parameters<OnEventHandler | OnAccountsChangedHandler | OnNetworkChangedHandler>

type OnEventFn = (...params: OnEventParameters) => void