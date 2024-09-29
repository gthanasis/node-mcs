import 'source-map-support/register'

import 'dotenv/config'
import {Logger, BunyanLogger} from 'logger'
import imagesRouteGenerator from './useCases/images/routes'

import {StorageMsc} from './service'

const name = process.env.SERVER_NAME || 'backend'
const logger: BunyanLogger = new Logger({name: name, level: process.env.LOG_LEVEL}).detach()

const msc = new StorageMsc(
    {
        env: process.env.NODE_ENV || 'development',
        host: process.env.HOST || '0.0.0.0',
        logger: logger,
        name: name,
        options: {
            bodyUrlencoded: true
        },
        port: parseInt(process.env.SERVER_PORT || '3000'),
        version: process.env.SERVER_VERSION || '1.0.0'
    }
)

msc.addRouter(imagesRouteGenerator(msc))
msc.start()
