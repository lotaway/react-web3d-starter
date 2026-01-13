// 1. Get projectId at https://cloud.walletconnect.com
export const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID
// 2. Set chains
const ETHEREUM = {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://cloudflare-eth.com'
}
const LINEA_TEST = {
    chainId: 59140,
    name: 'Linea Testnet',
    currency: 'LineaETH',
    explorerUrl: 'https://goerli.lineascan.build',
    rpcUrl: 'https://rpc.goerli.linea.build'
}
const LINEA = {
    chainId: 59144,
    name: 'Linea',
    currency: 'ETH',
    explorerUrl: 'https://lineascan.build/',
    rpcUrl: 'https://rpc.linea.build'
}
export const CHAINS = [
    ETHEREUM,
    LINEA,
    LINEA_TEST,
]
// 3. Create modal
export const METADATA = {
    name: 'Way',
    description: 'test way',
    url: 'https://www.lins20.com/',
    icons: ['https://www.lins20.com/favicon.ico']
}

export const getMainNet = () => {
    const chainId = Number(import.meta.env.VITE_CHAIN_ID);
    const chain = CHAINS.find(c => c.chainId === chainId);
    if (!chain) {
        throw new Error(`Chain ID ${chainId} not found in CHAINS configuration. Please check your .env file.`);
    }
    return chain;
}