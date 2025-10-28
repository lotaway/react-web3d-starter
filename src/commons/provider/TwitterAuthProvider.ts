import UserService from "../api/UserService"
import TwitterService from "../api/TwitterService"
import {TWITTER_ACCOUNT_NAME, TWITTER_API_HOST} from "../config/url"

export enum TwitterVerifyType {
    WITH_API,
    ONLY_AUTH,
    PROXY_BACK_END,
}

export class TwitterAuthProvider implements SocialMediaAuthProvider {
    hasAuth: boolean = false
    token: string = ""
    twitterTempDataKey = "twitter::oauth_token"
    private userService = new UserService()
    private apiHost = TWITTER_API_HOST
    private twitterService = new TwitterService()
    private verifyType: TwitterVerifyType = TwitterVerifyType.ONLY_AUTH
    private accessToken: string = ""
    private userId: string = ""
    private callbackUrl: string = ""

    static create(hasAuth: boolean, token: string, verifyType: TwitterVerifyType, callbackUrl: string) {
        const controller = new TwitterAuthProvider()
        controller.hasAuth = hasAuth
        controller.token = token
        controller.verifyType = verifyType
        controller.callbackUrl = callbackUrl
        return controller
    }

    static getUserMainPageUrl(userId: string) {
        return `https://twitter.com/${userId}`
    }

    static getTweetPageUrl(tweetId: number) {
        return `https://twitter.com/TheEconomist/status/${tweetId}`
    }

    setAuthInfo(accessToken: string, userId: string) {
        this.accessToken = accessToken
        this.userId = userId
        return this
    }

    async startAuth() {
        /*const requestTokenResponse = await twitterService.requestToken({
            oauth_callback: "http://tsp.nat300.top/airdrop/bindAccount",
            oauth_consumer_key: import.meta.env.VITE_TWITTER_API_KEY,
        })*/
        const getTokenResponse = await this.userService.getTwitterRequestToken({
            Authorization: this.token,
            callbackUrl: this.callbackUrl,
        })
        const requestTokenResponse = await this.twitterService.callRequestToken(getTokenResponse.getData().data.replace(this.apiHost, ""))
        console.log(requestTokenResponse)
        if (requestTokenResponse.oauth_callback_confirmed === "false") {
            return Promise.reject("error in oauth_callback_confirmed")
        }
        localStorage.setItem(this.twitterTempDataKey, requestTokenResponse.oauth_token)
        /*const getAuthorizeResponse = await twitterService.getAuthorize({
            oauth_token: requestTokenResponse.oauth_token
        })*/
        window.open(`${this.apiHost}/oauth/authorize?oauth_token=${requestTokenResponse.oauth_token}`, "_blank")
        return Promise.resolve()
    }

    getTempOAuthToken() {
        return localStorage.getItem(this.twitterTempDataKey)
    }

    async follow(targetUserId: number | string) {
        switch (this.verifyType) {
            case TwitterVerifyType.WITH_API:
                const followResult = await this.twitterService.followUser({
                    Authorization: this.accessToken,
                    userId: this.userId,
                    target_user_id: targetUserId as string,
                })
                if (followResult.data.following || followResult.data.pending_follow) {
                    console.log("follow success")
                }
                break
            case TwitterVerifyType.PROXY_BACK_END:
                window.open(TwitterAuthProvider.getUserMainPageUrl(TWITTER_ACCOUNT_NAME), "_blank")
                break
            case TwitterVerifyType.ONLY_AUTH:
                await this.userService.updateUserStatusToFollowedTwitter({
                    Authorization: this.token,
                })
                return true
            default:
                return true
        }
    }

    async checkFollowStatus(targetUserId: number) {
        switch (this.verifyType) {
            case TwitterVerifyType.PROXY_BACK_END:
                const result = await this.userService.checkUserFollowedTwitter({
                    Authorization: this.token,
                    twitterId: targetUserId,
                })
                return result.getData()
            case TwitterVerifyType.WITH_API:
            case TwitterVerifyType.ONLY_AUTH:
            default:
                return true
        }
    }

    async likeArticle(targetTweetId: number) {
        switch (this.verifyType) {
            case TwitterVerifyType.WITH_API:
                const likeResult = await this.twitterService.likeTwitter({
                    Authorization: this.accessToken,
                    userId: this.userId,
                    tweet_id: targetTweetId.toString(),
                })
                if (likeResult.data.liked) {
                    console.log("like success")
                }
                break
            case TwitterVerifyType.PROXY_BACK_END:
                window.open(TwitterAuthProvider.getTweetPageUrl(targetTweetId as number), "_blank")
                break
            case TwitterVerifyType.ONLY_AUTH:
                await this.userService.updateUserStatusToLikeTwitter({
                    Authorization: this.token,
                })
                return true
            default:
                return true
        }
    }

    async checkLikeArticleStatus(targetTweetId: number) {
        switch (this.verifyType) {
            case TwitterVerifyType.PROXY_BACK_END:
                const result = await this.userService.checkUserLikeTweet({
                    Authorization: this.token,
                    tweetId: targetTweetId,
                })
                return result.getData()
            case TwitterVerifyType.WITH_API:
            case TwitterVerifyType.ONLY_AUTH:
            default:
                return true
        }
    }

    async reArticle(targetTweetId: number) {
        switch (this.verifyType) {
            case TwitterVerifyType.WITH_API:
                const reTwitterResult = await this.twitterService.reTwitter({
                    Authorization: this.accessToken,
                    userId: this.userId,
                    tweet_id: targetTweetId.toString(),
                })
                if (reTwitterResult.data.retweeted) {
                    console.log("retwitter success")
                }
                break
            case TwitterVerifyType.PROXY_BACK_END:
                window.open(TwitterAuthProvider.getTweetPageUrl(targetTweetId), "_blank")
                break
            case TwitterVerifyType.ONLY_AUTH:
                await this.userService.updateUserStatusToQuoteTwitter({
                    Authorization: this.token,
                })
                return true
            default:
                return true
        }
    }

    async checkReArticleStatus(targetTweetId: number) {
        switch (this.verifyType) {
            case TwitterVerifyType.PROXY_BACK_END:
                const result = await this.userService.checkUserReTweet({
                    Authorization: this.token,
                    tweetId: targetTweetId,
                })
                return result.getData()
            case TwitterVerifyType.WITH_API:
            case TwitterVerifyType.ONLY_AUTH:
            default:
                return true
        }
    }
}