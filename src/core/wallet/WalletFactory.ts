import { WalletName } from "../IWallet";
import { IWalletProvider } from "./IWalletProvider";
import { MetaMaskProvider } from "../../commons/provider/MetaMaskProvider";
import { PhantomProvider } from "../../commons/provider/PhantomProvider";
import { WalletConnectProvider } from "../../commons/provider/WalletConnectProvider";
import { SolflareProvider } from "../../commons/provider/SolflareProvider";
import { OKXProvider } from "../../commons/provider/OKXProvider";
import { UniSatProvider } from "../../commons/provider/UniSatProvider";

export class WalletFactory {
    private static providers: Map<WalletName, IWalletProvider> = new Map();

    static getProvider(name: WalletName): IWalletProvider {
        if (this.providers.has(name)) {
            return this.providers.get(name)!;
        }

        let provider: IWalletProvider;
        switch (name) {
            case WalletName.METAMASK:
                provider = new MetaMaskProvider();
                break;
            case WalletName.PHANTOM:
                provider = new PhantomProvider();
                break;
            case WalletName.WALLETCONNECT:
                provider = WalletConnectProvider.getInstance();
                break;
            case WalletName.SOLFLARE:
                provider = new SolflareProvider();
                break;
            case WalletName.OKX:
                provider = OKXProvider.getInstance();
                break;
            case WalletName.UNISAT:
                provider = UniSatProvider.getInstance();
                break;
            default:
                throw new Error(`Wallet ${WalletName[name]} not supported yet`);
        }

        this.providers.set(name, provider);
        return provider;
    }
}
