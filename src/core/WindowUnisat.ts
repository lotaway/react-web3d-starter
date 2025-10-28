interface UniSatInscription extends NSBitcoin.Inscription {
    inscriptionNumber: string
    output: string
    content: string
    contentLength: string
    contentType: number
    preview: number
    timestamp: number
    genesisTransaction: string
}

interface SendOptions {
    feeRate: number // the network fee rate
}

interface WindowUnisat extends NSBitcoin.IBitcoin {
    getAccounts: () => Promise<Array<string>>
    switchNetwork: (network: string) => Promise<void>
    sendInscription: (address: string, inscriptionId: string, options: SendOptions) => Promise<NSBitcoin.TXId>
    inscribeTransfer: (ticker: string, amount: string) => Promise<void>
}