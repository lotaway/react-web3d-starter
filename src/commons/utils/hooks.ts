import {useState, useEffect} from "react"

export function useDebounce(defaultValue: any, delay = 16) {
    const [value, setValue] = useState(defaultValue)
    useEffect(() => {
        const counter = setTimeout(() => setValue(value), delay)
        return () => {
            counter && clearTimeout(counter)
        }
    }, [defaultValue])
    return value
}