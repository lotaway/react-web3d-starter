import DropdownMenu, {DropdownMenuProps} from "../../../commons/layouts/DropdownMenu/DropdownMenu"
import Box from "../../../commons/layouts/Box/Box"
import iconArrowDownSimple from "../../../application/assets/icon-arrow-down-simple.svg"
import {HTMLAttributes, useState} from "react"
import {useTranslation} from "react-i18next"
import "./Dropdown.sass"

type Props = {
    title?: string
    defaultSelected?: number
    onMenuItemClick?: (index: number, value?: string | number) => void
    onClose?: DropdownMenuProps["onClose"]
    menuList: Array<{
        icon?: string,
        text: string,
        value?: string | number,
        disabled?: boolean
    }>
} & HTMLAttributes<HTMLDivElement>

export default function Dropdown({title, defaultSelected, onMenuItemClick, onClose, menuList, className, ...others}: Props) {
    const {t} = useTranslation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [selected, setSelected] = useState(0)

    function _onMenuItemClick(index: number, value?: string | number) {
        setSelected(index)
        setIsMenuOpen(false)
        onMenuItemClick?.(index, value)
    }

    return (
        <div className={`drop-down ${className ?? ""}`} {...others}>
            <Box className="flex justify-between items-center" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <span className="drop-down-title fl">{title ?? menuList[selected].text}</span>
                <img className="icon" src={iconArrowDownSimple} alt="icon"/>
            </Box>
            {isMenuOpen
                ? <DropdownMenu onClose={onClose}>
                    {
                        menuList.map((item, index) => (
                            <Box className={`pointer hover transition-fast ${selected === index ? "selected" : ""}`}
                                 key={index}
                                 onClick={() => _onMenuItemClick(index, item.value)}>
                                {
                                    item.icon
                                        ? <img src={item.icon} alt="icon"/>
                                        : ""
                                }
                                <span className="text">{item.text}</span>
                            </Box>
                        ))
                    }
                </DropdownMenu>
                : ""
            }
        </div>
    )
}