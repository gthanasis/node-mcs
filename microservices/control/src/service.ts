import 'dotenv/config'
import Microservice, { ServiceConstructorProps } from 'microservice'

import { PostgreSqlPersistence } from 'library'

export class RankingMsc extends Microservice {
    public persistence: PostgreSqlPersistence

    constructor (props: ServiceConstructorProps) {
        super(props)
        this.persistence = new PostgreSqlPersistence({
            connectionString: process.env.PG_CONNECTION_STRING as string
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
