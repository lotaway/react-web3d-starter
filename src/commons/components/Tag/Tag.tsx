import "./Tag.sass"

type Props = {
    text: string
}

export default function Tag(props: Props) {
    return (
        <span className="component-tag">{props.text}</span>
    )
}