interface CategoryAdArgs extends BaseArgs {
    categoryIdentity: number | string     //  分类标识
    duoge?: number     //  是否多个 (0,不是;1是;默认不是)
    location: string        //  位置
    pageName: string            //  页面
}

interface CategoryAdResponse extends BaseArgs {
    src: string
    link?: string
    url?: string
}

interface GetPublicAdArgs extends BaseArgs {
    isMutiple?: number  //  是否多个 (0,不是;1是;默认不是)
    location: string    //  广告所处位置
    name: string    //  大类所处页面名
}

type GetPublicAdResponse = {
    alt: string
    height: string
    src: string
    url: string
    width: string
}

type GetPublicAdsResponse = GetPublicAdResponse[]

interface GetAppHomeBannerArgs {
    num?: number
}

interface GetAppStartAdParam extends BaseArgs {
    type?: string,  //  类型：[home:启动图，boot:引导图]
    num?: number    //  数量
}

interface AppImgItem extends BaseArgs {
    "@src": string
    ad: string
}

interface GetAppStartAdResponse extends Array<AppImgItem> {
}
