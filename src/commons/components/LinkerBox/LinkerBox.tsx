import "./LinkerBox.sass"
import React from "react"

interface LinkerBoxProps {
    title?: string
    buttonText: string
    buttonIcon?: string
    isChecked?: boolean
    onClick: () => void
}

export default function LinkerBox(props: LinkerBoxProps) {
    return (
        <div className="linker-box clearFix">
            {
                props.title
                    ? <label className="input-box-title fl">{props.title}</label>
                    : ""
            }
            <div className="fr flex items-center">
                {props.isChecked
                    ? <span className="checker checked"></span>
                    : <a className="button pointer transition-fast hover fr flex items-center"
                         onClick={props.onClick}>
                        <span>{props.buttonText}</span>
                        {
                            props.buttonIcon
                                ? <img className="icon" src={props.buttonIcon} alt="iocn"/>
                                : ""
                        }
                    </a>
                }
            </div>
        </div>
    )
}