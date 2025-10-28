// <reference path="../config/init_config.ts"/>
import initConfig from "../config/init"
import Decorator from "../commons/utils/support"

@Decorator.ImplementsWithStatic<ILoggerWithStatic>()
export default class Logger {

    static instance: Logger | undefined

    constructor(protected isOn: boolean = initConfig.DEBUG) {
    }

    output(message: any, force?: boolean) {
        return (force ?? this.isOn) && console.log(message)
    }

    private static ParamChecker(target: any, propName: string, descriptor: PropertyDescriptor) {
        const methods = descriptor.value
        descriptor.value = function (desc: string, ...params: any[]) {
            return methods.call(this, desc || "Logger", ...params)
        }
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Logger()
        }
        return this.instance
    }

    @Logger.ParamChecker
    static Simple(desc?: string) {
        const logger = Logger.getInstance()
        // logger.output("启用 logger.simple ——" + desc)
        return (target: any, propName: string, descriptor: PropertyDescriptor) => {
            const methods = descriptor.value
            // logger.output("set ——" + desc)
            descriptor.value = function (...params: any[]) {
                logger.output("调用 ——" + desc)
                return methods.call(this, ...params)
            }
        }
    }

    @Logger.ParamChecker
    static Detail(desc?: string) {
        const logger = Logger.getInstance()
        // logger.output("启用 logger.detail ——" + desc)
        return function (target: any, propName: string, descriptor: PropertyDescriptor) {
            const methods = descriptor.value
            // logger.output("定义 " + target.name + "." + propName + " ——" + desc)
            descriptor.value = function (...params: any[]) {
                logger.output("调用 " + (target.name || target.constructor.name) + "." + propName + " with params:" + JSON.stringify(params) + " ——" + desc)
                return methods.call(this, ...params)
            }
        }
    }

}
