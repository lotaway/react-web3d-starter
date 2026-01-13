import {initializeConnector} from '@web3-react/core'
import {MetaMask} from '@web3-react/metamask'
import {onConnectionError, Connection} from './connections'
import {TokenPocketConnector} from "@/commons/provider/TokenPocketConnector"
import {Connector} from "@web3-react/types";

export function buildInjectedConnector(mustBeMetaMask?: boolean): Connection {
    const [connector, hooks] = initializeConnector<MetaMask>(
        (actions) => new MetaMask({
            actions,
            onError: onConnectionError,
            options: {
                mustBeMetaMask,
            },
        }),
    )
    return {
        connector,
        hooks,
    }
}

export function buildTokenPocketConnector() {
    const [connector, hooks] = initializeConnector<Connector>(
        (actions) => new TokenPocketConnector(actions)
    )
    return {
        connector,
        hooks,
    }
}