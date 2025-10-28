import "./InputBox.sass"

interface InputBoxProps {
    title?: string
    placeholder?: string
    value?: string
    isChecked?: boolean
    onChange?: (value: string) => void
}

export default function InputBox(props: InputBoxProps) {
    function onChange(value: string) {
        props.onChange && props.onChange(value)
    }

    return (
        <div className="input-box flex items-center">
            {
                props.title
                    ? <label className="input-box-title">{props.title}</label>
                    : ""
            }
            <input
                className="input-box-input"
                type="text"
                placeholder={props.placeholder || ""}
                value={props.value}
                onChange={event => onChange(event.target.value)}/>
            <span className={`checker ${props.isChecked ? "checked" : "no-check"}`}></span>
        </div>
    )
}