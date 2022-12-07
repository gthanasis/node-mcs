import { ObjectId } from 'mongodb'
import IPersistence, {Order, Pagination, Query} from './IPersistence'

export default class InMemoryPersistence implements IPersistence {
    private dbCollection: any

    constructor (collections: any, collectionName: string) {
        if (collections[collectionName] === undefined) {
            throw Error(`Collection ${collectionName} not found`)
        }

        this.dbCollection = collections[collectionName]
    }

    // Find one by primary _id
    async find<T> (id: string): Promise<T> {
        const document = this.dbCollection.find((entity: any) => entity._id === id)
        return document === undefined ? null : document
    }

    // Find one by query
    async findBy<T> (where: Query): Promise<T> {
        const document = this.dbCollection.find((entity: any) => this.matches(entity, where))
        return document === undefined ? null : document
    }

    // Find all by query
    async findAll<T> (where: Query): Promise<T[]> {
        const documents = this.dbCollection.filter((entity: any) => this.matches(entity, where))
        return documents
    }

    async count (where: Query[], table: string, order?: Order, pagination?: Pagination): Promise<number> {
        const documents = this.dbCollection.filter((entity: any) => this.matches(entity, where))
        return documents.length
    }

    async create<T> (modelInstances: any): Promise<T> {
        this.dbCollection = this.dbCollection.concat(modelInstances)
        return modelInstances
    }

    async update<T> (attributes: any, where: Query): Promise<T[]> {
        try {
            if (Object.keys(attributes).length === 0) {
                throw Error('Attributes empty')
            }

            delete attributes._id
            delete attributes.creationDate
            const updatedDocs: any = []
            for (let i = 0; i < this.dbCollection.length; i++) {
                if (this.matches(this.dbCollection[i], where)) {
                    this.dbCollection[i] = {
                        ...this.dbCollection[i],
                        ...attributes,
                        updatedDate: new Date(Date.now())
                    }

                    updatedDocs.push(this.dbCollection[i])
                }
            }

            return updatedDocs
        } catch (e: any) {
            console.log('error', e.message)
            return []
        }
    }

    async replace<T> (attributes: any, where: Query): Promise<T | null> {
        delete attributes._id
        const originalDoc = await this.dbCollection.find((entity: any) => this.matches(entity, where))

        for (let i = 0; i < this.dbCollection.length; i++) {
            if (this.matches(this.dbCollection[i], where)) {
                this.dbCollection[i] = {
                    ...attributes,
                    _id: originalDoc._id,
                    createdDate: originalDoc.createdDate,
                    updatedDate: new Date(Date.now())
                }

                return this.dbCollection[i]
            }
        }
        return null
    }

    async delete<T> (where: Query): Promise<T[]> {
        const newCollection = this.dbCollection.filter((entity: any) => !this.matches(entity, where))
        const deleteables = this.dbCollection.filter((entity: any) => this.matches(entity, where))
        this.dbCollection = newCollection

        return deleteables
    }

    transformIdField (id: string): string {
        return id
    }

    private matches (entity: any, where: Query) {
        return Object.keys(where).every((key: string) => {
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
