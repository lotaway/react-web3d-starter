import React, {useState, useEffect, ChangeEvent, useTransition, useContext, useCallback} from "react";
import {BlockChainContext} from "../../../application/context/BlockChainContext"

type Props = {
    addressTo: string
    amount?: string
    keyword?: string
    message?: string
};

export default function PayContract({addressTo, amount, keyword, message}: Props) {
    const {currentWalletAccount, connectWallet, sendTransaction} = useContext(BlockChainContext);
    const [formData, setFormData] = useState({
        addressTo: addressTo,
        amount: amount ?? "0",
        keyword: keyword ?? "mwt",
        message: message ?? "pay from mwt"
    });
    const [isLoading, startTransition] = useTransition();
    const handleChange = (event: ChangeEvent<HTMLInputElement>, name: string) => {
        // do some api check maybe ?
        // setValue(Number(event.target.value));
        setFormData(prevState => ({...prevState, [name]: event.target?.value || ""}));
    };
    const handleSubmit = (event: any) => {
        event.preventDefault();
        const {addressTo, amount, keyword, message} = formData;
        if (!addressTo || !amount || !keyword || !message) {
            return;
        }
        sendTransaction({
            addressTo,
            amount,
            keyword,
            message
        });
    };
    return (
        <form>
            {
                isLoading ? <p>Loading...</p> : null
            }
            {!currentWalletAccount ? <button onClick={connectWallet}>Connect Wallet</button> : null}
            <input type="number" step="0.0001" value={formData.amount}
                   onChange={event => handleChange(event, "amount")}/>
            <button type="submit" onClick={event => handleSubmit(event)}>Transfer</button>
        </form>
    );
}
