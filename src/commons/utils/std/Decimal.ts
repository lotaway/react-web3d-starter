import BigNumber from "bignumber.js"

class Decimal extends BigNumber {

    static SeededRandom = class {
        constructor(private seed: number) {
        }

        random(max?: number, min?: number) {
            max = max || 1
            min = min || 0
            this.seed = (this.seed * 9301 + 49297) % 233280
            const rnd = this.seed / 233280.0
            return min + rnd * (max - min)
        }

        randomInt(max: number, min: number) {
            return Math.ceil(this.random(max, min))
        }
    }

    constructor(value?: any) {
        super(typeof value === "object" && value !== null ? value.toString() : (value ?? 0))
    }

    static new(value: any) {
        return new Decimal(value)
    }

    static get BIG_INT_MAX_VALUE() {
        return new Decimal(BigInt("1".repeat(100)))
    }

    decimalInfo() {
        const _value = this.toString()
        const dotIndex = _value.indexOf('.')
        const decimalPart = dotIndex === -1 ? "" : _value.substring(dotIndex + 1)
        const zeroMatch = decimalPart.match(/^(0+)/)
        const zeroPart = zeroMatch ? zeroMatch[0] : ""
        const zerosCount = zeroPart.length
        const nonZeroPart = decimalPart.substring(zerosCount)
        return {
            decimalPart,
            dotIndex,
            zeroPart,
            zerosCount,
            nonZeroPart,
        }
    }

    keepEffectDecimal(keepDecimal: number, decimal: number) {
        const _value = this.toString()
        let { decimalPart, nonZeroPart, dotIndex, zerosCount, zeroPart } = this.decimalInfo()
    
        if (nonZeroPart.length > keepDecimal) {
            nonZeroPart = nonZeroPart.substring(0, keepDecimal)
        }
        
        const formattedNumber = _value.substring(0, dotIndex === -1 ? _value.length : dotIndex + zerosCount + 1) + nonZeroPart
        
        if (dotIndex !== -1 && zerosCount > 0 && decimalPart.match(/^0+$/) === null) {
            return `${formattedNumber.substring(0, dotIndex + 2)}${zeroPart}${nonZeroPart.replace(/0+$/, "")}`
        }
    
        const result = Number(_value) === 0
            ? '0'
            : dotIndex !== -1 && _value.length > dotIndex + 1 + decimal
                ? `${_value.substring(0, dotIndex + 1 + decimal)}`
                : _value

        if (dotIndex !== -1) {
            const [integer, fractional = ''] = result.split('.')
            return `${integer}.${fractional.slice(0, keepDecimal)}`
        }
    
        return result
    }

    getAbbreviatedValue() {
        if (this.lte(1e12)) return { value: this.div(1e12), suffix: 'T' }
        if (this.gte(1e9)) return { value: this.div(1e9), suffix: 'B' }
        if (this.gte(1e6)) return { value: this.div(1e6), suffix: 'M' }
        if (this.gte(1e3)) return { value: this.div(1e3), suffix: 'K' }
        return { value: this, suffix: '' }
    }

}

export default Decimal