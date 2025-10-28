import {createContext, ReactNode, useEffect, useState} from "react"
import {ethers} from "ethers"
import {deployedContract} from "../../config/constants"
import {useTranslation} from "react-i18next"
import EthersProvider from "../../commons/provider/EthersProvider"
// import { AccountTransfer, AccountTransfer__factory } from "../../config/contractAbi/types"

interface ISendTransactionArgument {
    addressTo: string
    amount: string
    keyword: string
    message: string
}

export const BlockChainContext = createContext<any>({})

export const {ethereum} = window as any

const getContacts = async () => {
    const provider = EthersProvider.getInstance(ethereum)
    const signer = await provider.getSigner()
    // const accountTransferContract = ethers.BaseContract.from<AccountTransfer>(deployedContract.accountTransfer.address, deployedContract.accountTransfer.abi, signer)
    // const accountTransferContract = AccountTransfer__factory.connect(deployedContract.accountTransfer.address, signer)
    // const contract = new AccountTransfer__factory()
    // const accountTransferContract = contract.attach(deployedContract.accountTransfer.address).connect(signer)
    // return {accountTransferContract}
}

export const BlockChainProvider = ({children}: { children: ReactNode }) => {
    const {t} = useTranslation()
    const [isTransacting, setIsTransacting] = useState(false)
    const [currentWalletAccount, setCurrentWalletAccount] = useState("")
    const [transactionCount, setTransactionCount] = useState(0)    //  应使用类似localstorage保存缓存
    const [transactionRecords, setTransactionRecords] = useState([])
    const initWalletConnect = async () => {
        try {
            if (!ethereum) {
                return alert(t("connectWalletError"))
            }
            const accounts = await ethereum.request({
                method: "eth_accounts"
            })
            // @todo need correct see:https://ethereum.org/en/developers/docs/
            // const avatar = await ethereum.send("eth_getProfile", [accounts[0]])
            accounts.length && setCurrentWalletAccount(accounts[0])
            void getTransactionRecords()
        } catch (err) {
            console.error(err)
            throw new Error(t("evmObjMissing"))
        }
    }
    const connectWallet = async () => {
        try {
            if (!ethereum) {
                return alert(t("connectWalletError"))
            }
            //  the external account
            const accounts = await ethereum.request({
                method: "eth_requestAccounts"
            })
            setCurrentWalletAccount(accounts[0])
        } catch (err) {
            console.error(err)
            throw new Error(t("evmObjMissing"))
        }
    }
    const sendTransaction = async ({addressTo, amount, keyword, message}: ISendTransactionArgument) => {
        try {
            if (!ethereum) {
                return new Error(t("evmObjMissing"))
            }
            // const {accountTransferContract} = await getContacts()
            //  直接从钱包账户之间转账，没有放入合约账户
            await ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: currentWalletAccount,
                    to: addressTo,
                    gas: "0x5208",  //  21000 GWEI
                    // value: ethers.utils.parseEther(amount)._hex,
                    value: ethers.formatEther(amount),
                }]
            })
            // const transactionHash = await accountTransferContract.addRecord(addressTo, amount, message, keyword)
            // setIsTransacting(true)
            // console.log(`Transacting - ${transactionHash.hash}`)
            // await transactionHash.wait()   //  交易完成回调
            // setIsTransacting(false)
            // console.log(`Transaction Success - ${transactionHash.hash}`)
            // const transactionCount = await accountTransferContract.getRecordCount()
            // setTransactionCount(Number(transactionCount))
        } catch (err) {
            console.error(err)
            throw new Error(t("evmObjMissing"))
        }
    }
    const getTransactionRecords = async () => {
        try {
            if (!ethereum) {
                return alert(t("connectWalletError"))
            }
            // const {accountTransferContract} = await getContacts()
            // const accountTransferRecords = await accountTransferContract.getRecord()
            // setTransactionRecords(accountTransferRecords.map((transaction: any) => ({
            //     addressTo: transaction.receiver,
            //     from: transaction.sender,
            //     amount: parseInt(transaction.amount._hex) * (10 ** 18),
            //     message: transaction.message,
            //     keyword: transaction.keyword.split(" ").join(","),
            //     timestamp: (new Date(transaction.timestamp.toNumber() * 1000)).toLocaleString()
            // })))
        } catch (err) {
            console.error(err)
            throw new Error(t("evmObjMissing"))
        }
    }
    useEffect(() => {
        void initWalletConnect()
    }, [])
    return (
        <BlockChainContext.Provider value={{
            isTransacting,
            connectWallet,
            currentWalletAccount,
            sendTransaction,
            transactionCount,
            transactionRecords
        }}>
            {children}
        </BlockChainContext.Provider>
    )
}
