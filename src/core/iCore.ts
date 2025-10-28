interface UploadFileArgs {
    method?: string
    headers?: {
        [key: string]: string
    }
}

interface IBaseProviderOptions {
    dataType?: string,
    method?: string,
    signal?: AbortSignal
}

interface ILogger {
    output(message: any, force?: boolean): void
}

interface ILoggerWithStatic<T extends ILogger = ILogger> {
    new(...args: any[]): T
    instance: ILogger | undefined
}

interface ISystem {
    uploadFile(apiUrl: string, file: File, options: UploadFileArgs): Promise<any>

    // stopFile(): boolean
    request<responseData extends any>(apiUrl: string, data: object, options?: IBaseProviderOptions): Promise<responseData>

    print(message: string): void

    language(): string
}

interface ISystemWithStatic<T extends ISystem = ISystem> {
    new(...args: any[]): T
}
