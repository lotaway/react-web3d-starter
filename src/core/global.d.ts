declare global {
    export interface Window {
        ethereum?: Eip1193Provider
        okxwallet?: OKXWalletBitcoin.WindowOKXWallet
        unisat?: WindowUnisat
    }
}

interface Comparator<T> {
    compare(o1: T, o2: T): number

    equals(obj: object): boolean
}

interface Comparable<T> {
    compareTo(o: T): number
}

interface SortedMap<K, V> extends Map<K, V> {
    comparator: Comparator<K>
}

type ChainExecutor<Self extends ChainRunnable = ChainRunnable> = (self: Self) => void

interface ChainRunnable {
    chainRunner(fn: ChainExecutor): ChainRunnable
}