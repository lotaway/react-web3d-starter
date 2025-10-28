import "./EyeCatchingTag.sass"
import {PropsWithChildren} from "react"

interface Props {
}

export default function EyeCatchingTag(props: PropsWithChildren<Props>) {
    return (
        <div className="eye-catching-tag text-center">
            {props.children}
        </div>
    )
}