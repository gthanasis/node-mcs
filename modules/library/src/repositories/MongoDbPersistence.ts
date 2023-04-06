import {Db, MongoClient, MongoNetworkError, ObjectID} from 'mongodb'
import IPersistence, {Order, Pagination, Query} from './IPersistence'
import {Promise} from 'bluebird'
import _ from 'lodash'
import {WithID, WithLodashID} from 'project-types'

type MongoDbConstructorProps = {
    connectionString: string
}

export type MongoQueryOptions = { query: Query, pagination?: Pagination | null, order?: Order | null, search?: string | null }
type GetPaginationProps = {
    page: number
    pageSize: number
}

type PageOffsetLimit = {
    offset: number
    limit: number
}

class MongoDbPersistence implements IPersistence {
    private connectionString: any
    private options: {
        keepAlive: boolean;
        socketTimeoutMS: number;
        connectTimeoutMS: number;
        useNewUrlParser: boolean
    }
    private client: MongoClient
    private db: Db | undefined
    private connecting: boolean

    constructor (props: MongoDbConstructorProps) {
        const { connectionString } = props
        this.connectionString = connectionString
        this.options = {
            keepAlive: true,
            connectTimeoutMS: 120000,
            socketTimeoutMS: 0,
            useNewUrlParser: true
        }
        this.client = new MongoClient(this.connectionString, this.options)
        this.client.on('close', this.close.bind(this))
        this.client.on('reconnect', () => { console.log(`MongoDB database connection re-established.`) })
        this.connecting = false
    }

    async query<ReturnType> (props: MongoQueryOptions & { table: string }): Promise<ReturnType[]> {
        const { query, table, order, pagination } = props
        // console.log({ query, table, order, pagination })
        if (!this.db) throw new Error('Mongo not yet connected')
        const res = await this.db.collection(table)
        .find<ReturnType>(query, {})
        .skip(pagination ? pagination.offset : 0)
        .limit(pagination ? pagination.limit : 0)
        .sort(order ? { [order.field]: order.direction === 'asc' ? 1 : -1 } : { _id: 1 })
        .toArray()
        return res
    }

    async count<ReturnType> (props: MongoQueryOptions & { table: string }): Promise<number> {
        const { query, table, order, pagination } = props
        if (!this.db) throw new Error('Mongo not yet connected')
        const res = await this.db.collection(table)
        .find<ReturnType>(query, {})
        .sort(order ? { [order.field]: order.direction === 'asc' ? 1 : -1 } : { _id: 1 })
        .count()
        return res
    }

    async create<Model> (modelInstances: Partial<Model>, table: string): Promise<WithLodashID<Model>> {
        if (!this.db) throw new Error('Mongo not yet connected')
        const createRes = await this.db.collection(table).insertOne(modelInstances, {})
        const res = await this.db.collection(table).findOne<WithLodashID<Model>>({ _id: createRes.insertedId }, {})
        if (res === null) throw new Error(`Could not create model, ${JSON.stringify(modelInstances)}`)
        return res
    }

    async update<Model> (attributes: Record<string, string>, where: Query, table: string): Promise<WithLodashID<Model>[]> {
        where = _.omitBy(where, _.isNil)
        if (!this.db) throw new Error('Mongo not yet connected')
        await this.db.collection(table).updateOne(where, { $set: attributes }, {})
        const res = await this.db.collection(table).find<WithLodashID<Model>>(where, {}).toArray()
        return res
    }

    async delete<Model> (where: Query, table: string): Promise<WithLodashID<Model>[]> {
        where = _.omitBy(where, _.isNil)
        if (!this.db) throw new Error('Mongo not yet connected')
        const toDelete = await this.db.collection(table).find<WithLodashID<Model>>(where, {}).toArray()
        const deleteRes = await this.db.collection(table).deleteMany(where, {})
        return toDelete
    }

    async connect (): Promise<void> {
        this.connecting = true
        this.client = await this.client.connect()
        this.db = this.client.db()
        this.connecting = false
    }

    async disconnect (): Promise<void> {
        await this.client.close()
    }

    async close (err: Error): Promise<void> {
        if (!(err instanceof MongoNetworkError)) return console.warn(`⛁ MongoDB database connection closed.`)
        if (!this.connecting) setTimeout(() => this.connect.apply(this), 5000)
    }

    resolveId<Type> (obj): Type {
        const { _id, ...rest } = obj
        return { id: _id, ...rest }
    }

    getPagination (props: GetPaginationProps): PageOffsetLimit {
        const { page, pageSize } = props
        const offset = (page - 1) * pageSize
        const limit = pageSize
        return { offset, limit }
    }
    
    translateQuery (queryParams: Record<string, any>, search?: string | null) {
        const mongoQuery: any = {}

        for (const [key, value] of Object.entries(queryParams)) {
            switch (key) {
                case 'search':
                    break
                case 'id':
                    if (Array.isArray(value)) {
                        mongoQuery._id = { $in: value.map(ObjectID) }
                    } else {
                        mongoQuery._id = ObjectID(value) as number
                    }
                    break
                default:
                    if (Array.isArray(value)) {
                        mongoQuery[key] = { $in: value }
                    } else {
                        mongoQuery[key] = value
                    }
                    break
            }
        }
        if (search) mongoQuery.$text = { $search: search as string }
        return mongoQuery
    }
}

export default MongoDbPersistence
export { ObjectID }
