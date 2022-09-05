import OauthTokenManager, { oAuthManagerConstructorArgs } from './oauthTokenManager'
import { BunyanLogger } from 'logger'
import fetch from 'node-fetch'
import FormData from 'form-data'
import moment from 'moment'

interface ZohoOAuthManagerConstructorArgs extends oAuthManagerConstructorArgs {
    logger: BunyanLogger
    clientID: string
    clientSecret: string
    redirectURI: string
    grantType: string
    refreshToken: string
}

interface zohoRefreshResponse {
    error?: string | undefined
    // eslint-disable-next-line camelcase
    access_token?: string | undefined
    // eslint-disable-next-line camelcase
    expires_in: number
}

class ZohoOauthTokenManager extends OauthTokenManager {
    private readonly clientID: string
    private readonly clientSecret: string
    private readonly redirectURI: string
    private readonly grantType: string
    private readonly refreshToken: string
    private logger: BunyanLogger

    constructor (options: ZohoOAuthManagerConstructorArgs) {
        super(options)
        this.clientID = options.clientID
        this.clientSecret = options.clientSecret
        this.redirectURI = options.redirectURI
        this.grantType = options.grantType
        this.refreshToken = options.refreshToken
        this.logger = options.logger.child({ 'class.name': 'ZohoOauthTokenManager', 'instance.clientID': this.clientID })
    }

    getValidToken (): string | undefined {
        this.logger.trace(`Token ${this.token} expires at ${this.expires.format()}`)
        if (this.token === undefined || moment().isAfter(this.expires)) return undefined
        return this.token
    }

    async refresh (): Promise<boolean> {
        const form = new FormData()
        form.append('refresh_token', this.refreshToken)
        form.append('client_id', this.clientID)
        form.append('client_secret', this.clientSecret)
        form.append('redirect_uri', this.redirectURI)
        form.append('grant_type', this.grantType)
        const res = await fetch(this.oauthUrl, { method: 'POST', body: form })
        const zohoResponse: zohoRefreshResponse = await res.json()
        this.logger.trace('Zoho response', zohoResponse)
        if (zohoResponse.error) throw (new Error(zohoResponse.error))
        this.token = zohoResponse.access_token
        this.expires = moment().add(zohoResponse.expires_in, 'seconds')
        return Promise.resolve(true)
    }
}

export default ZohoOauthTokenManager
