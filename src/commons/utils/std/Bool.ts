import { Options } from "./Struct";

export class Bool extends Options<boolean> {

    constructor(value?: boolean | null) {
        super(value)
    }

    static TRUE = new Bool(true)
    static FALSE = new Bool(false)

    static new(value: any, defaultValue: Bool | boolean | null = null) {
        if (typeof value === "boolean") {
            return new Bool(value)
        }
        if (typeof value === "string") {
            const str = value.toUpperCase()
            return new Bool(str === "TRUE" || str === "1" || str === "1n" || str === "YES" || str === "Y" || str === "ON" || str === "ENABLED")
        }
        if (typeof value === "number") {
            return new Bool(value === 1)
        }
        if (typeof value === "bigint") {
            return new Bool(value === 1n)
        }
        const noValue = value === null || value === undefined
        if (noValue) {
            if (defaultValue instanceof Bool) {
                return defaultValue
            }
            return Bool.FALSE
        }
        return new Bool(Boolean(value))
    }

    static builder_with_default(defaultValue: "true" | "false" | Bool | boolean | null = null) {
        if (typeof defaultValue === "string") {
            return (value: any) => Bool.new(value, defaultValue === "true")
        }
        if (defaultValue instanceof Bool) {
            return (value: any) => Bool.new(value, defaultValue)
        }
        return (value: any) => Bool.new(value, defaultValue)
    }

}