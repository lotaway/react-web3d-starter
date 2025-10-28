import Decorator, {obj2FormData} from "../commons/utils/support"
import Logger from "./Logger"

@Decorator.ImplementsWithStatic<ISystemWithStatic>()
export default class System {
    private static instance: ISystem | undefined

    constructor(protected readonly loggerImpl: ILogger) {
    }

    static getInstance() {
        if (this.instance)
            return this.instance
        this.instance = new System(Logger.getInstance())
        return this.instance
    }

    async uploadFile(apiUrl: string, file: File, options: UploadFileArgs) {
        const formData = new FormData()
        formData.append("file", file)
        let headers = options.headers || {}
        headers['Content-Type'] = 'multipart/form-data'
        return await fetch(apiUrl, {
            method: options.method || "POST",
            body: formData,
            headers
        }).then(response => response.ok ? response.json() : Promise.reject(response))
    }

    async request<responseData = any>(apiUrl: string, data: object, options?: IBaseProviderOptions) {
        return await fetch(apiUrl, {
            method: options?.method || "POST",
            body: obj2FormData(data),
            signal: options?.signal
        }).then(response => response.ok ? (response.json() as Promise<responseData>) : Promise.reject(response))
    }

    print(message: string) {
        this.loggerImpl.output(message)
    }

    language() {
        return navigator.language
    }

    db() {
        return window.indexedDB
    }

}

export class Snowflake {
    private datacenterId: number
    private machineId: number
    private sequence: number
    private twepoch: number
    private datacenterIdBits: number
    private machineIdBits: number
    private sequenceBits: number
    private maxDatacenterId: number
    private maxMachineId: number
    private maxSequence: number
    private machineIdShift: number
    private datacenterIdShift: number
    private timestampShift: number
    private lastTimestamp: number

    constructor(datacenterId: number, machineId: number) {
        this.datacenterId = datacenterId
        this.machineId = machineId
        this.sequence = 0
        this.twepoch = 1577836800000 // Epoch time (2020-01-01)

        this.datacenterIdBits = 5
        this.machineIdBits = 5
        this.sequenceBits = 12

        this.maxDatacenterId = -1 ^ (-1 << this.datacenterIdBits)
        this.maxMachineId = -1 ^ (-1 << this.machineIdBits)
        this.maxSequence = -1 ^ (-1 << this.sequenceBits)

        this.machineIdShift = this.sequenceBits
        this.datacenterIdShift = this.sequenceBits + this.machineIdBits
        this.timestampShift = this.sequenceBits + this.machineIdBits + this.datacenterIdBits

        this.lastTimestamp = -1
    }

    private getTimestamp(): number {
        return Date.now()
    }

    private tilNextMillis(lastTimestamp: number): number {
        let timestamp = this.getTimestamp()
        while (timestamp <= lastTimestamp) {
            timestamp = this.getTimestamp()
        }
        return timestamp
    }

    nextId(): bigint {
        let timestamp = this.getTimestamp()

        if (timestamp < this.lastTimestamp) {
            throw new Error('Clock moved backwards')
        }

        if (this.lastTimestamp === timestamp) {
            this.sequence = (this.sequence + 1) & this.maxSequence
            if (this.sequence === 0) {
                timestamp = this.tilNextMillis(this.lastTimestamp)
            }
        } else {
            this.sequence = 0
        }

        this.lastTimestamp = timestamp

        return (
            BigInt((timestamp - this.twepoch) << this.timestampShift) |
            BigInt(this.datacenterId << this.datacenterIdShift) |
            BigInt(this.machineId << this.machineIdShift) |
            BigInt(this.sequence)
        )
    }
}