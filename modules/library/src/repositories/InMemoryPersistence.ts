import IPersistence, {Order, Pagination, Query} from './IPersistence'
import Utils from './utlis'
import _ from 'lodash'

export default class InMemoryPersistence implements IPersistence {
    private dbCollection: Record<string, any> = {}
    private id = 0

    constructor (collections: string[]) {
        collections.forEach(col => {
            this.dbCollection[col] = []
        })
    }

    // Find one by primary _id
    async find<T> (id: string, table: string): Promise<T> {
        const document = this.dbCollection[table].find((entity: any) => entity._id === id)
        return document === undefined ? null : document
    }

    // Find one by query
    async findBy<T> (where: Query, table: string): Promise<T> {
        where = _.omitBy(where, _.isNil)
        const document = this.dbCollection[table].find((entity: any) => this.matches(entity, where))
        return document === undefined ? null : document
    }

    // Find all by query
    async findAll<T> (where: Query[], table: string): Promise<T[]> {
        where = where.map(w => _.omitBy(w, _.isNil))
        const normalizedQuery = Utils.normalizeQuery(where)
        const documents = this.dbCollection[table].filter((entity: any) => this.matches(entity, normalizedQuery))
        return documents
    }

    async count (where: Query[], table: string, order?: Order, pagination?: Pagination): Promise<number> {
        where = where.map(w => _.omitBy(w, _.isNil))
        const normalizedQuery = Utils.normalizeQuery(where)
        const documents = this.dbCollection[table].filter((entity: any) => this.matches(entity, normalizedQuery))
        return documents.length
    }

    async create<T> (modelInstances: any, table: string): Promise<T> {
        this.id++
        const newId = `${this.id}`
        this.dbCollection[table] = this.dbCollection[table].concat({ ...modelInstances, _id: newId })
        const found = this.dbCollection[table].find(e => e._id === newId)
        if (found === undefined) throw new Error(`Could not create model. ${JSON.stringify(modelInstances)}`)
        return found
    }

    // TODO: this works as replace function where it should update only the field that we pass
    async update<T> (attributes: any, where: Query, table: string): Promise<T[]> {
        where = _.omitBy(where, _.isNil)
        try {
            if (Object.keys(attributes).length === 0) {
                throw Error('Attributes empty')
            }

            delete attributes._id
            delete attributes.creationDate
            const updatedDocs: any = []
            for (let i = 0; i < this.dbCollection[table].length; i++) {
                if (this.matches(this.dbCollection[table][i], where)) {
                    this.dbCollection[table][i] = {
                        ...this.dbCollection[table][i],
                        ...attributes,
                        updatedDate: new Date(Date.now())
                    }

                    updatedDocs.push(this.dbCollection[table][i])
                }
            }

            return updatedDocs
        } catch (e: any) {
            console.log('error', e.message)
            return []
        }
    }

    async replace<T> (attributes: any, where: Query, table: string): Promise<T | null> {
        where = _.omitBy(where, _.isNil)
        delete attributes._id
        const originalDoc = await this.dbCollection[table].find((entity: any) => this.matches(entity, where))

        for (let i = 0; i < this.dbCollection[table].length; i++) {
            if (this.matches(this.dbCollection[table][i], where)) {
                this.dbCollection[table][i] = {
                    ...attributes,
                    _id: originalDoc._id,
                    createdDate: originalDoc.createdDate,
                    updatedDate: new Date(Date.now())
                }

                return this.dbCollection[table][i]
            }
        }
        return null
    }

    async delete<T> (where: Query, table: string): Promise<T[]> {
        where = _.omitBy(where, _.isNil)
        const newCollection = this.dbCollection[table].filter((entity: any) => !this.matches(entity, where))
        const deleteables = this.dbCollection[table].filter((entity: any) => this.matches(entity, where))
        this.dbCollection[table] = newCollection

        return deleteables
    }

    transformIdField (id: string): string {
        return id
    }

    private matches (entity: any, where: Query) {
        return Object.keys(where).every((key: string) => {
            if (where[key] === undefined) return true
            if (key === 'id') {
                where['_id'] = where['id']
                delete where['id']
            }
            return where[key] === entity[key]
        })
    }

    async connect () {
        return Promise.resolve()
    }

    async disconnect () {
        return Promise.resolve()
    }

    directQuery<T> (text: string, values: string[]): Promise<T[]> {
        return Promise.resolve([])
    }
}
