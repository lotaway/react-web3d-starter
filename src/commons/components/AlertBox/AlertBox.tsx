import {PropsWithChildren} from "react"
import "./AlertBox.sass"
import iconWaring from "../../assets/icon-warning.svg"

interface Props {
    // icon: string
}

export default function AlertBox(props: PropsWithChildren<Props>) {
    return (
        <div className="alert-box flex items-center">
            <img className="icon" src={iconWaring} alt="icon"/>
            <p className="text">{props.children}</p>
        </div>
    )
}