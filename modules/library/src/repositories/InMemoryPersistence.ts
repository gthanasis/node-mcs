import { ObjectId } from 'mongodb'
import IPersistence, { Query } from './IPersistence'

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
        const document = this.dbCollection.find((entity: any) => { entity._id === id })
        return document === undefined ? null : document
    }

    // Find one by query
    async findBy<T> (where: Query): Promise<T> {
        const document = this.dbCollection.find((entity: any) => this.matches(entity, where))
        return document === undefined ? null : document
    }

    // Find all by query
    async findAll<T> (where: Query): Promise<T> {
        const documents = this.dbCollection.filter((entity: any) => this.matches(entity, where))
        return documents
    }

    async create<T> (modelInstances: any | any[]): Promise<T[]> {
        try {
            if (modelInstances === null || modelInstances === undefined) {
                throw Error('Cannot save empty document')
            }

            if (Array.isArray(modelInstances) && modelInstances.length === 0) {
                throw Error('Cannot save empty document')
            }

            if (Object.getPrototypeOf(modelInstances) === Object.prototype && Object.keys(modelInstances).length === 0) {
                throw Error('Cannot save empty document')
            }

            const saveable = Array.isArray(modelInstances) ? modelInstances : [modelInstances]
            saveable.forEach(entity => {
                if (entity.hasOwnProperty('_id')) {
                    entity._id = new ObjectId(entity._id)
                } else {
                    entity._id = new ObjectId()
                }

                entity.createdDate = new Date(Date.now())
                entity.updatedDate = new Date(Date.now())
            })

            this.dbCollection = this.dbCollection.concat(saveable)

            return saveable
        } catch (e: any) {
            console.log('error', e.message)
            return []
        }
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

    async destroy<T> (where: Query): Promise<T[]> {
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
}
