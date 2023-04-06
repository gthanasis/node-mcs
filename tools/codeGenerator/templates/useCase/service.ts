import {__useCase__Repository, retrieveWithFilterProps} from './repository'
import {__useCase__} from './model'
import {BunyanLogger} from 'logger'
import {I__useCase__} from 'project-types'

export class __useCase__Service {
    private repository: __useCase__Repository
    private logger: BunyanLogger

    constructor ({ repository, logger }: { repository: __useCase__Repository, logger: BunyanLogger}) {
        this.repository = repository
        this.logger = logger
    }

    async retrieve ({ query = {}, pagination, order, search }: retrieveWithFilterProps) {
        return await this.repository.retrieveWithFilter({ query, pagination, order, search })
    }

    async insert (payload: Partial<I__useCase__>) {
        const __useCase__(lowerCase) = __useCase__(payload)
        return await this.repository.insert(__useCase__(lowerCase))
    }

    async update ({ filters, attrs }: any) {
        return await this.repository.update({ filters, attrs })
    }

    async delete (filters: any) {
        return await this.repository.update({ filters, attrs: { deletedAt: new Date() } })
    }
}
