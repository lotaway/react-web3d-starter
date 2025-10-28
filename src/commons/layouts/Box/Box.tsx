import {HTMLAttributes, PropsWithChildren} from "react"
import "./Box.sass"

type BoxProps = PropsWithChildren<{
    size?: string
    disabled?: boolean
}> & HTMLAttributes<HTMLDivElement>

export default function Box({children, size, className, disabled, ...others}: BoxProps) {
    return (
        <div
            className={`box ${size === "large" ? "large" : ""} ${className ?? ""} ${disabled ? "disabled" : ""}`} {...others}>
            {children}
        </div>
    )
}