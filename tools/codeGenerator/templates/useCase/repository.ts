import {I__useCase__} from 'project-types'
import MongoDbPersistence, {MongoQueryOptions} from 'library/dist/repositories/MongoDbPersistence'
import {BunyanLogger} from 'logger'

export type retrieveWithFilterProps = {
    query: Record<string, any>
    order: { order: string | null, direction: string | null}
    pagination: { page: number, pageSize: number }
    search: string | null
}

export class __useCase__Repository {
    private persistence: MongoDbPersistence
    private readonly table: string
    private logger: BunyanLogger

    constructor ({ persistence, logger }: {persistence: MongoDbPersistence, logger: BunyanLogger}) {
        this.persistence = persistence
        this.logger = logger
        this.table = '__useCases__(lowerCase)'
    }

    async retrieveWithFilter ({ query, pagination, order, search }: retrieveWithFilterProps): Promise<{ __useCases__(lowerCase): I__useCase__[], count: number, pagination: { page: number, pageSize: number, filtered: number } }> {
        // here we normalize filters
        const normalizedFilters = this.persistence.translateQuery(query, search)
        const mongoPagination = this.persistence.getPagination(pagination)
        const mongoOrder: MongoQueryOptions['order'] = {
            field: order.order ? order.order : '_id',
            direction: order.direction ? order.direction : 'asc'
        }

        const results = await this.persistence.query<I__useCase__>({
            table: this.table,
            query: normalizedFilters,
            order: mongoOrder,
            pagination: mongoPagination
        })
        const count = await this.persistence.count<I__useCase__>({
            query: normalizedFilters,
            table: this.table,
            pagination: null,
            order: mongoOrder
        })
        return {
            __useCases__(lowerCase): results.map((__useCase__(lowerCase)) => this.persistence.resolveId<I__useCase__>(__useCase__(lowerCase))),
            count: count,
            pagination: { page: pagination.page, pageSize: pagination.pageSize, filtered: results.length }
        }
    }

    async insert (payload: Partial<I__useCase__>): Promise<I__useCase__> {
        console.log('Calling repo')
        const __useCase__(lowerCase) = await this.persistence.create<I__useCase__>(payload, this.table)
        return __useCase__(lowerCase)
    }

    async update ({ filters, attrs }: any): Promise<I__useCase__[]> {
        attrs['updatedAt'] = new Date()
        const __useCases__(lowerCase) = await this.persistence.update<I__useCase__>(attrs, filters, this.table)
        return __useCases__(lowerCase).map((__useCase__(lowerCase)) => this.persistence.resolveId<I__useCase__>(__useCase__(lowerCase)))
    }
}
