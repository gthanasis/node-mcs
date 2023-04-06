import 'source-map-support/register'

import 'dotenv/config'
import {Logger, BunyanLogger} from 'logger'
import carRouteGenerator from './useCases/car/routes'

import {ControlMsc} from './service'

const name = process.env.SERVER_NAME || 'backend'
const logger: BunyanLogger = new Logger({name: name, level: process.env.LOG_LEVEL}).detach()

const msc = new ControlMsc(
    {
        env: process.env.NODE_ENV || 'development',
        host: process.env.HOST || '0.0.0.0',
        logger: logger,
        name: name,
        options: {},
        port: parseInt(process.env.SERVER_PORT || '3000'),
        version: process.env.SERVER_VERSION || '1.0.0'
    }
)

msc.addRouter(carRouteGenerator(msc))
msc.start()
