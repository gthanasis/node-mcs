import {ICar} from 'project-types'
import MongoDbPersistence, {MongoQueryOptions} from 'library/dist/repositories/MongoDbPersistence'
import {BunyanLogger} from 'logger'

export type retrieveWithFilterProps = {
    query: Record<string, any>
    order: { order: string | null, direction: string | null}
    pagination: { page: number, pageSize: number }
    search: string | null
}

export class CarRepository {
    private persistence: MongoDbPersistence
    private readonly table: string
    private logger: BunyanLogger

    constructor ({ persistence, logger }: {persistence: MongoDbPersistence, logger: BunyanLogger}) {
        this.persistence = persistence
        this.logger = logger
        this.table = 'cars'
    }

    async retrieveWithFilter ({ query, pagination, order, search }: retrieveWithFilterProps): Promise<{ cars: ICar[], count: number, pagination: { page: number, pageSize: number, filtered: number } }> {
        // here we normalize filters
        const normalizedFilters = this.persistence.translateQuery(query, search)
        const mongoPagination = this.persistence.getPagination(pagination)
        const mongoOrder: MongoQueryOptions['order'] = {
            field: order.order ? order.order : '_id',
            direction: order.direction ? order.direction : 'asc'
        }

        const results = await this.persistence.query<ICar>({
            table: this.table,
            query: normalizedFilters,
            order: mongoOrder,
            pagination: mongoPagination
        })
        const count = await this.persistence.count<ICar>({
            query: normalizedFilters,
            table: this.table,
            pagination: null,
            order: mongoOrder
        })
        return {
            cars: results.map((car) => this.persistence.resolveId<ICar>(car)),
            count: count,
            pagination: { page: pagination.page, pageSize: pagination.pageSize, filtered: results.length }
        }
    }

    async insert (payload: Partial<ICar>): Promise<ICar> {
        const car = await this.persistence.create<ICar>(payload, this.table)
        return car
    }

    async update ({ filters, attrs }: any): Promise<ICar[]> {
        attrs['updatedAt'] = new Date()
        const cars = await this.persistence.update<ICar>(attrs, filters, this.table)
        return cars.map((car) => this.persistence.resolveId<ICar>(car))
    }
}
