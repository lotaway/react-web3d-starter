// <reference path="../config/init_config.ts"/>
import initConfig from "../../config/init";
import host from "../../config/host";
import {API_URL} from "../../config/api";
import Decorator, { Data } from "../../commons/utils/support"
import {BaseHttpRequest, IApiProvider, IHttpRequestStatic, MapperWrapper} from "./base"
import { Str } from "../../commons/utils/std/Str";

namespace NSAdvertisement {

    export class Adapter {

        @Decorator.AddHost(host.goodsService)
        static getCategoryAd(res: CategoryAdResponse) {
            if (res) {
                res.url = res.link
                delete res.link
            }
            return res
        }

        @Decorator.AddHost(host.goodsService)
        static getPublicAd(res: GetPublicAdsResponse) {
            return res
        }

        @Decorator.AddHost(host.goodsService, ["src"])
        static getAppHomeBanner(res: GetPublicAdsResponse) {
            return res.map(item => new GetAppHomeBannerV2(item))
        }

        @Decorator.AddHost(host.goodsService, [["ad", '@src']])
        static getAppStartAd(res: GetAppStartAdResponse) {
            return res
        }
    }

    export class GetAppHomeBannerV2 extends Data.BaseDataAdapter<GetPublicAdResponse> {

        @Data.To(Str.builder_with_default(""))
        src!: string

        get srcWithHost() {
            return new URL(this.src, host.goodsService).toString()
        }

        @Data.To(Str.builder_with_default(""))
        url!: string

        get urlWithHost() {
            return new URL(this.url, host.goodsService).toString()
        }

        @Data.To(Str.builder_with_default(""))
        alt!: string

        @Data.To(Str.builder_with_default(""))
        height!: string

        @Data.To(Str.builder_with_default(""))
        width!: string

        constructor(originData: GetPublicAdResponse) {
            super(originData)
        }
    }

    @Decorator.ImplementsWithStatic<IHttpRequestStatic<IApiProvider<CategoryAdArgs, CategoryAdResponse>>>()
    export class CategoryAdMapper extends BaseHttpRequest {
        @Decorator.DefaultArgs<[CategoryAdArgs]>({
            categoryIdentity: "",
            duoge: 0,
            location: "",
            pageName: ""
        })
        @Decorator.Sign(API_URL.getCategoryAd)
        @Decorator.UseAdapter(Adapter.getCategoryAd)
        async start(args: CategoryAdArgs): Promise<CategoryAdResponse> {
            super.init()
            return await this.rpc.request<CategoryAdResponse>(API_URL.getCategoryAd, args, this.options)
        }
    }

    @Decorator.ImplementsWithStatic<IHttpRequestStatic<IApiProvider<GetPublicAdArgs, CategoryAdResponse>>>()
    export class PublicAdMapper extends BaseHttpRequest {
        @Decorator.DefaultArgs<[GetPublicAdArgs]>({
            isMutiple: 0,
            location: "",
            name: ""
        })
        @Decorator.Sign(API_URL.getPublicAd)
        @Decorator.UseAdapter(Adapter.getPublicAd)
        async start<T = GetPublicAdsResponse | GetPublicAdResponse>(args: GetPublicAdArgs): Promise<T> {
            super.init()
            return await this.rpc.request<T>(API_URL.getPublicAd, args, this.options)
        }
    }

    @Decorator.ImplementsWithStatic<IHttpRequestStatic<IApiProvider<GetAppHomeBannerArgs, GetPublicAdsResponse>>>()
    export class AppHomeBannerMapper extends BaseHttpRequest {

        @Decorator.DefaultArgs({
            num: initConfig.SLIDER_IMG_NUM,
            page: 1,
            type: "top"
        })
        @Decorator.Sign(API_URL.getAppHomeBanner)
        @Decorator.UseAdapter(Adapter.getAppHomeBanner)
        async start(args: GetAppHomeBannerArgs): Promise<GetPublicAdsResponse> {
            super.init()
            return await this.rpc.request<GetPublicAdsResponse>(API_URL.getPublicAd, args, this.options)
        }
    }

    @Decorator.ImplementsWithStatic<IHttpRequestStatic<IApiProvider<GetAppStartAdParam, GetAppStartAdResponse>>>()
    export class AppStartAdMapper extends BaseHttpRequest {

        @Decorator.DefaultArgs({
            type: "home",
            num: 1
        })
        @Decorator.Sign(API_URL.getAppStartAd)
        @Decorator.UseAdapter(Adapter.getAppStartAd)
        async start(args: GetAppStartAdParam): Promise<GetAppStartAdResponse> {
            super.init()
            return await this.rpc.request<GetAppStartAdResponse>(API_URL.getAppStartAd, args, this.options)
        }
    }

    export class Service {

        private readonly mapperWrapper: MapperWrapper

        constructor(systemImpl: ISystem) {
            this.mapperWrapper = new MapperWrapper(systemImpl)
        }

        get system(): ISystem {
            return this.mapperWrapper.system
        }

        async getCategoryAds<Args extends CategoryAdArgs, ResponseData>(args: Args, mapper: IApiProvider<Args, ResponseData>) {
            return await mapper.start(args)
        }

        async getCategoryAd(args: CategoryAdArgs) {
            return await this.mapperWrapper.start(CategoryAdMapper, args)
        }

        async getPublicAd<T = GetPublicAdsResponse | GetPublicAdResponse>(args: GetPublicAdArgs) {
            return await this.mapperWrapper.start<GetPublicAdArgs, T>(PublicAdMapper, args)
        }

        async getLogo() {
            return await this.getPublicAd({
                name: "home",
                location: "logo"
            })
        }

        async getAppHomeBanner(args: GetAppHomeBannerArgs = {}) {
            return await this.mapperWrapper.start(AppHomeBannerMapper, args)
        }

        async getAppStartAd(args: GetAppStartAdParam = {}) {
            return await this.mapperWrapper.start(AppStartAdMapper, args)
        }

    }
}

export default NSAdvertisement
