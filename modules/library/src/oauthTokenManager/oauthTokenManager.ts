import moment from 'moment'

export type oAuthManagerConstructorArgs = {
    oauthUrl: string
}

abstract class OauthTokenManager {
    protected token: string | undefined
    protected oauthUrl: string
    protected expires: moment.Moment
    abstract getValidToken(): undefined | string
    abstract refresh(): void

    protected constructor (options: oAuthManagerConstructorArgs) {
        this.oauthUrl = options.oauthUrl
        this.token = undefined
        this.expires = moment()
    }
}

export default OauthTokenManager
