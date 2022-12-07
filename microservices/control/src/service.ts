import 'dotenv/config'
import Microservice, { ServiceConstructorProps } from 'microservice'

import {InMemoryPersistence} from 'library'

export class SampleMsc extends Microservice {
    public persistence: InMemoryPersistence

    constructor (props: ServiceConstructorProps) {
        super(props)
        this.persistence = new InMemoryPersistence(['samples'])
    }

    protected async createConnections (): Promise<void> {
        await this.persistence.connect()
        return
    }

    protected async closeConnections (): Promise<void> {
        return await this.persistence.disconnect()
    }
}
