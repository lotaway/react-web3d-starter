import {
    forwardRef,
    ButtonHTMLAttributes,
    FunctionComponent,
    PropsWithChildren,
    PropsWithRef,
    LegacyRef
} from "react"
import style from "./AntButton.module.sass"

type IAntButtonType = "default" | "primary" | "dashed" | "text" | "link"

// ButtonHTMLAttributes<HTMLButtonElement>
type IProps = PropsWithRef<PropsWithChildren<{
    ref?: LegacyRef<HTMLButtonElement>
    type?: IAntButtonType
    icon?: string
    shape?: string
    className: ButtonHTMLAttributes<any>["className"]
}>>

type InferFirst<T> = T extends [infer First, ...any[]] ? First : T

function getItem<ItemType>(args: [ItemType, ...unknown[]] | ItemType): ItemType {
    return Array.isArray(args) ? args[0] : args
}


const AntButton: FunctionComponent<IProps> = ({ref, type, shape, className, children, ...rProps}) => {
    switch (type) {
        case style.primary:
        case style.dashed:
        case style.text:
        case style.link:
            // console.log("match")
            break
        default:
            break
    }
    const styles: string = (className ?? "") + (type ?? style.primary) + (shape ?? "")
    return (
        <button ref={ref} className={styles} {...rProps}>{children}</button>
    )
}

// export default forwardRef<IProps>(AntButton)