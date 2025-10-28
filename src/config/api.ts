//  接口配置
import host from "./host"

const prevV1 = `${host.goodsService}/ashx`
const nextV1 = ".ashx"
const prevV2 = `${host.goodsService}/api/app/`
const nextV2 = ".api"
const templateFolderPlaceHolder = "templateFolder"
const configPrevFix = `${host.goodsService}/Config/public`
const templateFolderPrevFix = "/templates/mobi/{" + templateFolderPlaceHolder + "}/config"
const configNext = ".xml"
const API_URL = {
    //      用于HybridApp（权限验证采用cookie+参数加密签名）
    getUserOrderRecord: prevV2 + "GetOrderListByUser" + nextV2        //      获取用户订单
    , getUserCart: prevV2 + "GetShoppingCart" + nextV2      //      获取用户普通商品购物车
    , pushNoticeRegister: prevV2 + "JudgeAppId" + nextV2        //      注册应用推送
    , userRegister: prevV2 + "AddUser" + nextV2       //      注册用户
    , getUserInfo: prevV2 + "GetUserByUserName" + nextV2 //     用户登录（处理登录凭证）并返回用户信息
    , getCategoryAd: prevV2 + "getCategoryAdverts" + nextV2 //     获取分类广告图
    , getPublicAd: prevV2 + "GetAd" + nextV2   //      获取自定义广告图
    , getAppHomeBanner: prevV2 + "AdverInfoList" + nextV2  //      获取应用轮播图
    , getAppStartAd: prevV2 + "AppImg" + nextV2         //      获取应用启动图或者引导图
    , getSalesGoods: prevV2 + "GetGoodsSalesCharts" + nextV2     //      获取打折促销商品
    , getTaggedGoods: prevV2 + "GoodsInfoListForAllCategory" + nextV2   //      获取已标签（新品、精品、热销）的商品
    , getCategoryAndBrand: prevV2 + "CategoryBrand" + nextV2   //      获取商品分类和品牌
    , weChatPrevPay: prevV2 + "WeiXinPay" + nextV2  //      微信应用支付预处理
    //      用于WebApp（权限验证采用cookie）
    , getCategory: "/api/category/categoryByParentId"  //  根据分类标识获取子分类
    , getNormalGoods: prevV1 + "/cn/goods" + nextV1  //  获取普通商品
    , updateUserCart: prevV1 + "/cn/shopping_cart" + nextV1  //  更新用户购物车
    , checkUserAuth: prevV1 + "/cn/detection_session" + nextV1 //   检查用户凭证（session）
    , goodsPrevSettle: prevV1 + "/cn/settlement" + nextV1 //   商品结算
    , addToCart: prevV1 + "/cn/add_shopping_cart" + nextV1 //   商品加入购物车
    , selectGoodsAttr: prevV1 + "/cn/specifications" + nextV1 //   选择商品属性
    , scanSuccessNotice: prevV1 + "/cn/authorize_scanCode_notice" + nextV1  //      扫码成功通知（目前用于授权登录）
    , getUserNotice: "/user/notice"  //  获取用户通知消息
    , updateUserNotice: "/user/notice/read"  //  更新用户通知消息
    //      直接读取配置文件（无验证）
    , getWeChatConfig: configPrevFix + "/weixin_config" + configNext //  获取微信配置
    , getFunctionConfig: configPrevFix + "/function" + configNext //    获取功能设置
    , getSitePublicConfig: configPrevFix + "/site" + configNext //   获取站点公共配置
    , getUserMenu: templateFolderPrevFix + "/menu" + configNext //   获取会员菜单
    , getHomeMenu: templateFolderPrevFix + "/home_navigation_set" + configNext //   获取首页菜单
    , getTemplateConfig: templateFolderPrevFix + "/module_keyword" + configNext //      获取模板配置
    , getAppConfig: configPrevFix + "/appSetting.json"  //      获取应用设置
}

Object.freeze(API_URL)

export {API_URL, templateFolderPlaceHolder}
