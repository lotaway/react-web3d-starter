declare namespace OKXWalletBitcoin {
    interface WindowOKXWallet {
        request(options: {
                    method: string,
                    params?: object | Array<any>
        }): Promise<any>
        on: OnEventFn
        removeListener: OnEventFn

        bitcoin: NSBitcoin.IBitcoin & {
            signPsbts: (psbtHexs: PsbtHex[], options?: SignPsbtOptions[]) => Promise<string[]>
        }
    }

}