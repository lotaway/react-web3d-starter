import { Options } from "./Struct";
import { Tail } from "./types";

type ToShortParams = Tail<Parameters<typeof toShort>>

export class Str extends Options<string> {

    constructor(str?: string | null) {
        super(str)
    }

    static new(str: any, defaultValue: string | null = null) {
        return new Str(str === null || str === undefined ? defaultValue : String(str))
    }

    static builder_with_default(defaultValue: string | null = null) {
        return (str: any) => Str.new(str, defaultValue)
    }

    static generateRandomHexString(length: number = 66): string {
        const chars = '0123456789abcdef'
        let result = '0x'
        for (let i = 0; i < length - 2; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length)
            result += chars[randomIndex]
        }
        return result
    }

    toString() {
        return this.unwrap_with_default("")
    }

    toShort(...args: ToShortParams): string {
        return toShort(this.toString(), ...args)
    }

    toHex() {
        return this.toRadix(16)
    }

    toRadix(radix: number) {
        let hexStr = ''
        for (let i = 0; i < this.toString().length; i++) {
            const hex = this.toString().charCodeAt(i).toString(radix)
            hexStr += hex
        }
        return hexStr
    }

    toBytes() {
        var arr: number[] = []
        for (var i = 0; i < this.toString().length; i++) {
            arr.push(this.toString().charCodeAt(i))
        }
        return arr
    }

    toUtf8Bytes() {
        const utf8: number[] = []
        for (let ii = 0; ii < this.toString().length; ii++) {
            let charCode = this.toString().charCodeAt(ii)
            if (charCode < 0x80) utf8.push(charCode)
            else if (charCode < 0x800) {
                utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f))
            } else if (charCode < 0xd800 || charCode >= 0xe000) {
                utf8.push(
                    0xe0 | (charCode >> 12),
                    0x80 | ((charCode >> 6) & 0x3f),
                    0x80 | (charCode & 0x3f)
                )
            } else {
                ii++
                charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (this.toString().charCodeAt(ii) & 0x3ff))
                utf8.push(
                    0xf0 | (charCode >> 18),
                    0x80 | ((charCode >> 12) & 0x3f),
                    0x80 | ((charCode >> 6) & 0x3f),
                    0x80 | (charCode & 0x3f)
                )
            }
        }
        return utf8
    }

}

export function toShort(str: string, begin: number = 0, end: number = 10): string {
    return str.slice(0, begin) + '...' + str.slice(str.length - end)
}