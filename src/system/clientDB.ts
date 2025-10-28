import {Snowflake} from "./System";

export namespace ClientStore {

    function test() {
        const upgradeDBScript = new UpgradeDBScript(1)
        const clientDBTable = new ClientDBTable("nfts")
        clientDBTable
            .addField(new ClientDBField({
                name: "blockNumber",
                unique: true,
            }))
            .addField(new ClientDBField({
                name: "txid",
                unique: true,
            }))
            .addFieldsAsSimple(["startTime", "endTime", "image", "name", "price", "introduct", "description", "holderCount"])
        upgradeDBScript.addCommand(clientDBTable)
    }

    export class ClientDB {

        protected upgradeScripts: UpgradeDBScript[] = []
        protected db: IDBDatabase | null = null

        constructor(readonly dbFactory: IDBFactory) {}

        addUpgrade(script: UpgradeDBScript) {
            this.upgradeScripts.push(script)
        }

        connect(dbName: string, version: number = 1): Promise<IDBDatabase | null> {
            const request = this.dbFactory.open(dbName, version)
            const self = this
            return new Promise((resolve, reject) => {
                request.onupgradeneeded = function (event) {
                    const db = request.result
                    self.upgradeScripts.sort((first, second) => first.version - second.version).forEach(script => {
                        if (event.oldVersion < script.version) {
                            script.use(db)
                        }
                    })
                }
                request.onsuccess = function (event) {
                    self.db = request.result
                    resolve(self.db)
                }
                request.onerror = reject
            })
        }

        close() {
            this.db?.close()
        }

        getTable(storeName: string) {
            return new ClientDBTable(storeName)
        }

    }

    export class UpgradeDBScript {

        protected commands: DBCommand[] = []

        constructor(readonly version: number) {}

        addCommand(command: DBCommand) {
            this.commands.push(command)
        }

        use(db: IDBDatabase) {
            this.commands.forEach(command => command.use(db))
        }
    }

    export interface DBCommand {
        use(db: IDBDatabase): void
    }

    export interface IPageWrapper<DAO extends object> {
        getParams(): Partial<DAO>
        getSelector?: (params: Partial<DAO>) => IDBRequest<IDBCursorWithValue | null>
        getPage(): number
        getPageSize(): number
        getRange(): IDBKeyRange
        handler(data: DAO, cursor: IDBCursor): boolean
    }

    export abstract class BasePageWrapper<VO extends object> implements IPageWrapper<VO> {
        abstract getParams(): Partial<VO>
        abstract handler(data: VO, cursor: IDBCursor): boolean

        getPage(): number {
            return 1
        }

        getPageSize(): number {
            return 20
        }

        getRange(): IDBKeyRange {
            return IDBKeyRange.only('id')
        }
    }

    export class ClientDBTable<DO extends {id: string}> implements DBCommand {

        protected fields: ClientDBField[] = []
        protected snowflake: Snowflake

        constructor(readonly name: string, readonly key: string = "id") {
            this.snowflake = new Snowflake(1, 1)
        }

        addField(field: ClientDBField) {
            if (this.key === field.name) {
                throw new Error(`Field name "${field.name}" conflicts with the primary key`)
            }
            this.fields.push(field)
            return this
        }

        addFieldsAsSimple(names: string[]) {
            names.forEach(name => {
                this.addField(new ClientDBField({ name }))
            })
            return this
        }

        use(db: IDBDatabase): IDBObjectStore {
            let objectStore: IDBObjectStore
            if (db.objectStoreNames.contains(this.name)) {
                objectStore = db.transaction(this.name, "versionchange").objectStore(this.name)
            } else {
                objectStore = db.createObjectStore(this.name, { keyPath: this.key })
            }

            this.fields.forEach(field => field.use(objectStore))
            return objectStore
        }

        getData(db: IDBDatabase): Promise<DO[]> {
            const transaction = db.transaction(this.name, "readonly")
            const store = transaction.objectStore(this.name)
            const request = store.getAll()
            return new Promise((resolve, reject) => {
                transaction.oncomplete = () => resolve(request.result)
                transaction.onerror = reject
            })
        }

        addData(store: IDBObjectStore, data: Omit<DO, "id">): Promise<unknown> {
            (data as DO).id = this.snowflake.nextId().toString()
            const request = store.add(data)
            return this.handleRequest(request)
        }

        updateData(store: IDBObjectStore, data: DO): Promise<unknown> {
            const request = store.put(data)
            return this.handleRequest(request)
        }

        delData(store: IDBObjectStore, value: string): Promise<unknown> {
            const request = store.delete(IDBKeyRange.only(value))
            return this.handleRequest(request)
        }

        private handleRequest(request: IDBRequest): Promise<unknown> {
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result)
                request.onerror = () => reject(request.error)
            })
        }

        queryByPage(store: IDBObjectStore, wrapper: IPageWrapper<Partial<DO>>): Promise<boolean> {
            const page = wrapper.getPage()
            const pageSize = wrapper.getPageSize()
            return new Promise((resolve, reject) => {
                let skipped = false
                const request = wrapper.getSelector?.(wrapper.getParams()) ?? store.openCursor(wrapper.getRange())

                request.onsuccess = function () {
                    const cursor = request.result
                    if (!cursor || !cursor.value) {
                        return resolve(true)
                    }
                    if (!skipped) {
                        cursor.advance((page - 1) * pageSize)
                        skipped = true
                    }
                    if (wrapper.handler(cursor.value, cursor)) {
                        cursor.continue()
                    } else {
                        resolve(true)
                    }
                }
                request.onerror = reject
            })
        }

        async getDataByPage(store: IDBObjectStore, params: Partial<DO>): Promise<DO[]> {
            const tableRows: DO[] = []
            const wrapper = new class extends BasePageWrapper<DO> {
                getParams(): Partial<DO> {
                    return params
                }

                handler(data: DO): boolean {
                    tableRows.push(data)
                    return tableRows.length < this.getPageSize()
                }
            }
            await this.queryByPage(store, wrapper)
            return tableRows
        }

        async delDatas(store: IDBObjectStore, key: keyof DO, value: string): Promise<void> {
            const wrapper = new class extends BasePageWrapper<DO> {
                getSelector() {
                    return store.index(key as string).openCursor(IDBKeyRange.only(value))
                }

                getParams(): Partial<DO> {
                    return { [key]: value } as Partial<DO>
                }

                handler(data: DO, cursor: IDBCursor) {
                    const deleteRequest = cursor.delete()
                    deleteRequest.onsuccess = function () {
                        if (deleteRequest.result !== undefined) {
                            throw new Error("delete fail")
                        }
                    }
                    return true
                }
            }
            await this.queryByPage(store, wrapper)
        }
    }

    export class ClientDBField<Type = string> {

        constructor(readonly data: {
            name: string
            key?: string
            unique?: boolean
        }) {
            this.data.unique = this.data.unique ?? false
        }

        get name() {
            return this.data.name
        }

        use(objectStore: IDBObjectStore) {
            objectStore.createIndex(this.data.name, this.data.key ?? this.data.name, {
                unique: this.data.unique,
            })
        }
    }
}
