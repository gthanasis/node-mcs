import isbot from 'isbot'

import Logger, { BunyanLogger } from 'logger'
import userAgents from './userAgents'

type BotDetectionConstructorArgs = {
    logger: BunyanLogger
    exclude?: Array<string>
    inclusion?: Array<string>
}

class BotDetection {
    private logger: BunyanLogger
    private isBotLib

    constructor (options: BotDetectionConstructorArgs) {
        this.logger = options.logger
        const exclusion = Array.isArray(options.exclude) ? options.exclude : []
        const inclusion = Array.isArray(options.inclusion) ? options.inclusion : []
        isbot.extend(userAgents.concat(inclusion))
        isbot.exclude(exclusion)
        this.isBotLib = isbot
    }

    detect (userAgent: string): boolean {
        return this.isBotLib(userAgent)
    }
}

export default BotDetection
