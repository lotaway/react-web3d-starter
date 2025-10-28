import accountTemplateAbiJSON from "./contractAbi/AccountTemplate.json"
import accountTransferAbiJSON from "./contractAbi/AccountTransfer.json"

export const deployedContract = {
    accountTemplate: {
        abi: accountTemplateAbiJSON.abi,
        bytecode: accountTemplateAbiJSON.bytecode,
        address: "0xf1dF2479D55C17E0CC0984Fb5A15063F9Dc9a97D"
    },
    accountTransfer: {
        abi: accountTransferAbiJSON.abi,
        bytecode: accountTransferAbiJSON.bytecode,
        address: "0xea1828836e55f6B279346a8c87897530C1692a3c"
    }
}
