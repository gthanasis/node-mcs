import {Collection, Db, MongoClient, MongoClientOptions, MongoNetworkError} from 'mongodb'
import IPersistence, {Order, Pagination, Query} from './IPersistence'
import {Promise} from 'bluebird'
import Utils from './utlis'
import _ from 'lodash'

type MongoDbConstructorProps = {
    connectionString: string
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

    // Find one by primary _id
    async find<ReturnType> (id: string, table: string): Promise<ReturnType | null> {
        if (!this.db) throw new Error('Mongo not yet connected')
        const res = await this.db.collection(table).findOne<ReturnType>(
            { _id: id },
            {}
        )
        return res
    }

    // Find one by query
    async findBy<ReturnType> (where: Query, table: string): Promise<ReturnType | null> {
        where = _.omitBy(where, _.isNil)
        if (!this.db) throw new Error('Mongo not yet connected')
        const res = await this.db.collection(table).findOne<ReturnType>(
            where,
            {}
        )
        return res
    }

    async findAll<ReturnType> (where: Query[], table: string, order?: Order, pagination?: Pagination, search?: string): Promise<ReturnType[]> {
        where = where.map(w => _.omitBy(w, _.isNil))
        if (!this.db) throw new Error('Mongo not yet connected')
        const normalizedQuery = Utils.normalizeQuery(where)
        const res = await this.db.collection(table)
        .find<ReturnType>(normalizedQuery, {})
        .skip(pagination ? pagination.offset : 0)
        .limit(pagination ? pagination.limit : 0)
        .sort(order ? { [order.field]: order.direction === 'asc' ? 1 : -1 } : { _id: 1 })
        .toArray()
        return res
    }

    async count (where: Query[], table: string, order?: Order, pagination?: Pagination): Promise<number> {
        where = where.map(w => _.omitBy(w, _.isNil))
        if (!this.db) throw new Error('Mongo not yet connected')
        const normalizedQuery = Utils.normalizeQuery(where)
        const res = await this.db.collection(table)
        .count(normalizedQuery, {})
        return res
    }

    async create<Model> (modelInstances: Partial<Model>, table: string): Promise<Model> {
        if (!this.db) throw new Error('Mongo not yet connected')
        const createRes = await this.db.collection(table).insertOne(modelInstances, {})
        const res = await this.findBy<Model>({ _id: createRes.insertedId }, table)
        if (res === null) throw new Error(`Could not create model, ${JSON.stringify(modelInstances)}`)
        return res
    }

    async update<Model> (attributes: Record<string, string>, where: Query, table: string): Promise<Model[]> {
        where = _.omitBy(where, _.isNil)
        if (!this.db) throw new Error('Mongo not yet connected')
        await this.db.collection(table).updateOne(where, { $set: attributes }, {})
        const res = await this.findAll<Model>([where], table)
        return res
    }

    async delete<ReturnType> (where: Query, table: string): Promise<ReturnType[]> {
        where = _.omitBy(where, _.isNil)
        if (!this.db) throw new Error('Mongo not yet connected')
        const toDelete = await this.findAll<ReturnType>([where], table)
        const createRes = await this.db.collection(table).deleteMany(where, {})
        return toDelete
    }

    transformIdField (id: string): any {
        return id
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
}

export default MongoDbPersistence
