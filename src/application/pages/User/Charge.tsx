import Button from "../../../commons/components/Button/Button"
import { useTranslation } from "react-i18next"
import Dropdown from "../../../commons/container/Dropdown/Dropdown"
import "./Charge.sass"
import Box from "../../../commons/layouts/Box/Box"
import InputBox from "../../../commons/components/InputBox/InputBox"
import Tag from "../../../commons/components/Tag/Tag"

export default function Charge() {
    const { t } = useTranslation()
    const fromList = [
        {
            text: t("bitcoinMainNetTitle")
        },
        {
            text: t("ethereumTitle")
        }
    ]
    const coinUnit = [{
        text: "ETH",
    },
    {
        text: 'XUSD',
    },
    {
        text: "USDC",
    },
    {
        text: "USDT",
    },
    {
        text: "WBTC",
    },
    ]

    function selectFrom(index: number, value?: string | number) {
        //  @todo select where is it from, decide by wallet which linked in account
    }

    function selectCoinUnit(index: number, value?: string | number) {

    }

    return (
        <div className="charge flex justify-center">
            <form className="form flex flex-col items-center">
                <ul>
                    <li className="form-item flex justify-end items-start">
                        <label className="form-label start text-center">{t("fromTitle")}</label>
                        <div className="form-group">
                            <Box className="form-row">{fromList[0].text}</Box>
                        </div>
                    </li>
                    <li className="form-item flex justify-end items-start">
                        <div className="form-group flex flex-col justify-start items-stretch">
                            <Box className="flex justify-between items-center">
                                <Box className="">
                                    <InputBox placeholder="0.01" />
                                </Box>
                                <Tag text="MAX" />
                                <Dropdown className=""
                                    onMenuItemClick={selectCoinUnit}
                                    menuList={coinUnit} />
                            </Box>
                            <p className="tips">{t("fromAccountBalance")} 25.4597 BTC</p>
                        </div>
                    </li>
                    <li className="form-item flex justify-end items-start">
                        <label className="form-label end text-center">{t("toTitle")}</label>
                        <div className="form-group flex flex-col justify-start items-start">
                            <Box>WayLuk Coin</Box>
                            <p className="tips">{t("chargeTips")}</p>
                        </div>
                    </li>
                </ul>
                <div className="control flex justify-around">
                    <Button className="button">{t("submitButton")}</Button>
                </div>
            </form>
        </div>
    )
}