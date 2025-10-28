import {forwardRef, InputHTMLAttributes, useMemo} from "react"

export default forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    ({className, id, ...otherProps}, ref) => {
        const _id = useMemo(() => {
            return id ?? "input-" + Math.random() * 1000
        }, [id])
        return (
            <>
                {otherProps.title ? <label htmlFor={_id}>{otherProps.title}:</label> : null}
                <input id={_id} className={`py-1 px-2 border border-gray-400 focus:border-blue-500 outline-none rounded w-full input ${className ?? ""}`} ref={ref} {...otherProps} />
            </>
        )
    })
