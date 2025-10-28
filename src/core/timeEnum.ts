export enum JSTimeEnum {
    YEAR = 365 * 24 * 60 * 60 * 1000,
    MONTH = 30 * 24 * 60 * 60 * 1000,
    WEEK = 7 * 24 * 60 * 60 * 1000,
    DAY = 24 * 60 * 60 * 1000,
    HOUR = 60 * 60 * 1000,
    MINUTE = 60 * 1000,
    SECOND = 1000,
    MILLI_SECOND = 1,
}

export enum UnixTimeEnum {
    YEAR = 365 * 24 * 60 * 60,
    MONTH = 30 * 24 * 60 * 60,
    WEEK = 7 * 24 * 60 * 60,
    DAY = 24 * 60 * 60,
    HOUR = 60 * 60,
    MINUTE = 60,
    SECOND = 1,
    MILLI_SECOND = 1 / 1000,
}

export class TimeWrapper {

    constructor(protected readonly value: number, protected readonly radix: number = 1) {

    }

    static fromTimestamp(value: number | string | JSTimestamp) {
        const valueStr = parseInt(value.toString()).toString()
        if (parseInt(valueStr) !== Number(value)) {
            throw new Error(`TimeWrapper value must be integer, but get ${value}`)
        }
        if (valueStr.length >= 13) {
            return new TimeWrapper(Number(valueStr) / 1000)
        }
        if (valueStr.length > 10) {
            return new TimeWrapper(Number(valueStr.padEnd(13, "0")) / 1000)
        }
        return new TimeWrapper(Number(valueStr))
    }

    static fromJSTime(value: number | JSTimeEnum) {
        return new TimeWrapper(value / 1000)
    }

    static js2UnixTimestamp(time: number | JSTimestamp): UnixTimestamp {
        return time / 1000 as UnixTimestamp
    }

    static unix2JSTimestamp(time: number | UnixTimestamp): JSTimestamp {
        return time * 1000 as JSTimestamp
    }

    static js2UnixTimeEnum(time: number | JSTimeEnum): UnixTimeEnum {
        return time / 1000 as UnixTimeEnum
    }

    static unix2JSTimeEnum(time: number | UnixTimeEnum): JSTimeEnum {
        return time * 1000 as JSTimeEnum
    }

    valueOf() {
        return this.value
    }

    toJS(): number {
        return this.value * this.radix * 1000
    }

    toJSTimestamp(): string {
        return String(this.toJS()).padStart(13, "0")
    }

    toUnix(): number {
        return Math.floor(this.value) * this.radix
    }

    toUnixTimestamp(): string {
        return String(this.toUnix()).padStart(13, "0")
    }

}