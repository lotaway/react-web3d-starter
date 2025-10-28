
export class Time {
    radio = 1
    constructor(private value: number) {
    }

    static new(value: UnixTimestamp | JSTimestamp | number | string | bigint) {
        if (isNaN(Number(value))) {
            try {
                const timestamp = new Date(value.toString()).getTime()
                return this.fromNumber(timestamp)
            }
            catch (e) {
                throw new Error("Invalid timestamp value")
            }
        }
        const valueStr = value.toString()
        if (valueStr.length >= 13) {
            return this.from(BigInt(Number(valueStr.slice(0, 13 - 1))))
        }
        return this.fromString(valueStr.padEnd(13, '0'))
    }

    static toJSTime(value: UnixTimestamp | JSTimestamp | number | string | bigint) {
        return this.new(value).toJSTime()
    }

    static extendNumber() {
        if (typeof window !== "undefined" && window.Number) {
            // @ts-ignore
            window.Number.prototype.toTime = function() {
                return Time.fromNumber(this.valueOf())
            }
        }
    }

    static from(value: bigint) {
        if (value.toString().length >= 13) {
            return new this(Number(value.toString().slice(0, -3)))
        }
        return new this(Number(value))
    }

    static fromNumber(value: number) {
        return this.fromString(value.toString())
    }

    static fromString(value: string) {
        return this.from(BigInt(value))
    }

    static oneMonth() {
        return new this(30 * 24 * 60 * 60)
    }

    static oneWeek() {
        return new this(7 * 24 * 60 * 60)
    }

    static oneDay() {
        return new this(24 * 60 * 60)
    }

    static oneHour() {
        return new this(60 * 60)
    }

    static oneMinute() {
        return new this(60)
    }

    static oneSecond() {
        return new this(1)
    }

    static oneMillisecond() {
        return new this(1 / 1000)
    }

    days() {
        return new Days(this.value)
    }

    hours() {
        return new Hours(this.value)
    }

    minutes() {
        return new Minutes(this.value)
    }

    seconds() {
        return new Seconds(this.value)
    }

    milliseconds() {
        return new Milliseconds(this.value)
    }

    blockTime() {
        return new BlockTime(this.value)
    }

    toMonths() {
        return Number(this.value * this.radio / Time.oneMonth().toUnixTime())
    }

    toDays() {
        return Number(this.value * this.radio / Time.oneDay().toUnixTime())
    }

    toHours() {
        return Number(this.value * this.radio / Time.oneHour().toUnixTime())
    }

    toMinutes() {
        return Number(this.value * this.radio / Time.oneMinute().toUnixTime())
    }

    toSeconds() {
        return Number(this.value * this.radio)
    }

    toMilliseconds() {
        return Number(this.value * this.radio / Time.oneMillisecond().toUnixTime())
    }

    toUnixTime(): UnixTimestamp {
        return Number(this.value * this.radio) as UnixTimestamp
    }

    toBlockTime(): bigint {
        return BigInt(this.value * this.radio)
    }

    toJSTime(): JSTimestamp {
        return Number(this.value * this.radio * 1000) as JSTimestamp
    }

    toDate(): Date {
        return new Date(this.toJSTime())
    }
}

export class Days extends Time {
    radio = 24 * 60 * 60
    constructor(value: number) {
        super(value)
    }
}

export class Hours extends Time {
    radio = 60 * 60
    constructor(value: number) {
        super(value)
    }
}

export class Minutes extends Time {
    radio = 60
    constructor(value: number) {
        super(value)
    }
}

export class Seconds extends Time {
    radio = 1
    constructor(value: number) {
        super(value)
    }
}

export class Milliseconds extends Time {
    radio = 1 / 1000
}

export class BlockTime extends Seconds {
    constructor(value: number) {
        if (value.toString().length !== 10) {
            throw new Error("Invalid block timestamp value")
        }
        super(value)
    }
}
