import {HTMLAttributes, PropsWithChildren} from "react"
import "./Button.sass"

type Props = PropsWithChildren<{

}> & HTMLAttributes<HTMLButtonElement>

export default function Button({children, className, ...others}: Props) {
    return (
        <button className={`component-button bold pointer  transition-fast hover ${className}`} {...others}>
            {children}
        </button>
    )
}