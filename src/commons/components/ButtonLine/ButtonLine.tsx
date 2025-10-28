import {ButtonHTMLAttributes, MouseEventHandler, PropsWithChildren} from "react"
import "./ButtonLine.sass"

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>

export default function ButtonLine({className, children, ...other}: Props) {
    return (
        <button className={`component-button-line bold pointer  transition-fast hover ${className}`} {...other}>
            {children}
        </button>
    )
}