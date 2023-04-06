import 'dotenv/config'
import Microservice, { ServiceConstructorProps } from 'microservice'

import {MongoDbPersistence} from 'library'

export class ControlMsc extends Microservice {
    public persistence: MongoDbPersistence

    constructor (props: ServiceConstructorProps) {
        super(props)
        this.persistence = new MongoDbPersistence({
            connectionString: process.env.MONGO_CONNECTION_STRING as string
        })
    }

    protected async createConnections (): Promise<void> {
        await this.persistence.connect()
        return
    }

    protected async closeConnections (): Promise<void> {
        return await this.persistence.disconnect()
    }
}
