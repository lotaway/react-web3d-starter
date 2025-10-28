
export class StoreSize {
    constructor(private value: number) {
    }

    static new(value: number) {
        return new this(value)
    }

    static fromGB(value: number) {
        return new this(value * 1024 * 1024 * 1024)
    }

    static fromMB(value: number) {
        return new this(value * 1024 * 1024)
    }

    static fromKB(value: number) {
        return new this(value * 1024)
    }

    toGB() {
        return this.value / (1024 * 1024 * 1024)
    }

    toMB() {
        return this.value / (1024 * 1024)
    }

    toKB() {
        return this.value / 1024
    }

    toBytes() {
        return this.value
    }
}