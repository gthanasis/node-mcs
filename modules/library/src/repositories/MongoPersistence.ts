import {ObjectId} from 'mongodb'
import IPersistence, {Query} from './IPersistence'

export type MongoPersistenceIdType = ObjectId
class MongoPersistence implements IPersistence {
    private dbCollection: any

    constructor (collections: any, collectionName: string) {
        if (collections[collectionName] === undefined) {
            throw Error(`Collection ${collectionName} not found`)
        }

        this.dbCollection = collections[collectionName]
    }

    // Find one by primary _id
    async find<T> (_id: MongoPersistenceIdType): Promise<T> {
        return await this.dbCollection.findOne({_id})
    }

    // Find one by query
    async findBy<T> (where: Query): Promise<T> {
        return await this.dbCollection.findOne(where)
    }

    // Find all by query
    async findAll<T> (where: Query): Promise<T> {
        const documents = await this.dbCollection.find(where)
        return documents.toArray()
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
                    entity._id = this.transformIdField(entity._id)
                }

                entity.createdDate = new Date(Date.now())
                entity.updatedDate = new Date(Date.now())
            })

            const res = await this.dbCollection.insertMany(saveable)
            return res.ops
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

            delete attributes.creationDate

            const res = await this.dbCollection.updateMany(where, {
                $set: {
                    ...attributes,
                    updatedDate: new Date(Date.now())
                }
            })

            return await this.dbCollection.find(where).toArray()
        } catch (e: any) {
            console.log('error', e.message)
            return []
        }
    }

    async replace<T> (attributes: any, where: Query): Promise<T | null> {
        const originalDoc = await this.dbCollection.findOne(where)
        const res = await this.dbCollection.replaceOne(
            where,
            {
                ...attributes,
                createdDate: originalDoc.createdDate,
                updatedDate: new Date(Date.now())
            }
        )

        return this.dbCollection.findOne(where)
    }

    async destroy<T> (where: Query): Promise<T[]> {
        const deletable = await this.dbCollection.find(where).toArray()
        const res = await this.dbCollection.deleteMany(where)

        if (res.deletedCount > 0) {
            return deletable
        }

        return []
    }

    transformIdField (value: string): MongoPersistenceIdType {
        return new ObjectId(value)
    }
}

export default MongoPersistence
