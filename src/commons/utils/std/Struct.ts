enum State {
    SOLVE,
    NO_SOLVE,
}

interface IWrap<DataType> {

    unwrap(): DataType

    is_ok(): boolean

    or_else(f: () => DataType): this

    get_state(): State
}

abstract class Wrap<DataType> implements IWrap<DataType> {

    protected constructor(protected readonly state: State) {
    }

    get_state() {
        return this.state
    }

    abstract is_ok(): boolean

    abstract or_else(f: DataType | (() => DataType)): this

    abstract unwrap(): DataType

    abstract unwrap_with_default(f: DataType | (() => DataType)): DataType
}

export class Options<DataType> extends Wrap<DataType> implements IWrap<DataType> {

    protected val: DataType | null

    protected constructor(val?: DataType | null, state?: State) {
        super(state ?? val === null ? State.NO_SOLVE : State.SOLVE)
        this.val = val ?? null
    }

    static None<DataType>() {
        return new Options<DataType>(null, State.NO_SOLVE)
    }

    static Some<DataType>(val: DataType) {
        return new Options(val, State.SOLVE)
    }

    filter(predicate: (value: DataType | null) => boolean): Options<DataType> {
        return predicate(this.val) ? this : Options.None()
    }

    unwrap() {
        return this.val as DataType
    }

    protected _valueHandle(f: DataType | (() => DataType)) {
        return () => this.val ?? (typeof f === "function" ? (f as Function)() : f)
    }

    unwrap_with_default(f: DataType | (() => DataType)) {
        return this._valueHandle(f)()
    }

    is_ok() {
        return this.state === State.SOLVE
    }

    or_else(f: DataType | (() => DataType)) {
        this.unwrap = this._valueHandle(f)
        return this
    }

    static get SOME() {
        return State.SOLVE
    }

    static get NONE() {
        return State.NO_SOLVE
    }

}

export class Result<DataType> extends Wrap<DataType> implements IWrap<DataType> {

    private constructor(private val: DataType | null, state: State) {
        super(state)
    }

    static Error<ErrorType extends Error>(error: ErrorType) {
        return new Result(error, State.NO_SOLVE)
    }

    static Success<DataType>(val: DataType) {
        return new Result(val, State.SOLVE)
    }


    unwrap() {
        return this.val as DataType
    }

    protected _valueHandle(f: DataType | (() => DataType)) {
        return () => this.val ?? (typeof f === "function" ? (f as Function)() : f)
    }

    unwrap_with_default(f: DataType | (() => DataType)) {
        return this._valueHandle(f)()
    }

    is_ok() {
        return this.state === State.SOLVE
    }

    or_else(f: DataType | (() => DataType)) {
        this.unwrap = this._valueHandle(f)
        return this
    }

    get_state() {
        return this.state
    }

    static get SUCCESS() {
        return State.SOLVE
    }

    static get ERROR() {
        return State.NO_SOLVE
    }

}

export class StorageKey implements Serializable<StorageKey> {
    constructor(readonly key: { dbName: string, table: string, field: string, version: number }) {

    }

    static from(value: string): StorageKey {
        return new StorageKey(JSON.parse(value))
    }

    valueOf(): object {
        return this.key
    }

    toJSON(): string {
        return JSON.stringify(this.key)
    }

    static create(field: string, version: number = 1.0) {
        return new StorageKey({dbName: "", table: "", field, version})
    }

    getKey() {
        return `${this.key.dbName}:${this.key.table}:${this.key.field}:${this.key.version}`
    }
}

export class LocalStorageUtils {
    static set(key: StorageKey, value: string) {
        return localStorage.setItem(key.getKey(), value)
    }

    static get(key: StorageKey) {
        return localStorage.getItem(key.getKey())
    }

    static remove(key: StorageKey) {
        return localStorage.removeItem(key.getKey())
    }
}