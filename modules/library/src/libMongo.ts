// TODO: needs a rewrite

/**
 * libMongo module.
 * @module libMongo
 */

import _ from 'lodash' // eslint-disable-line no-unused-vars
import {Promise} from 'bluebird' // eslint-disable-line no-unused-vars
import {BunyanLogger} from 'logger'

import {Collection, Db, MongoClient, MongoClientOptions, MongoNetworkError} from 'mongodb'

type MongoConstructorProps = {
    uri: string
    collections: string[]
    logger: BunyanLogger
}

class Mongo {
    private URI: string
    private client!: MongoClient
    private db!: Db
    private collectionNames: string | string[]
    private collections: Record<string, Collection>
    private options: MongoClientOptions
    private logger: BunyanLogger;

    constructor ({uri, collections = [], logger}: MongoConstructorProps) {
        this.URI = uri
        this.collectionNames = collections
        this.collections = {}
        this.options = {
            keepAlive: true,
            connectTimeoutMS: 120000,
            socketTimeoutMS: 0,
            useNewUrlParser: true
            // useUnifiedTopology: true
        }
        this.logger = logger
    }

    /**
     * Opens a connection to MONGODB and sets up handlers.
     *
     * @returns {Promise}
     */
    initialize (): Promise<void> {
        return MongoClient.connect(this.URI, this.options)
        .then((client) => {
            this.client = client
            this.db = this.client.db()
            this.client.on('close', this._close.bind(this))
            this.client.on('reconnect', () => this.logger.info(`⛁ MongoDB database connection re-established.`))

            if (this.collectionNames === 'all') {
                return this.db.listCollections()
                .toArray()
                .then(cols => { cols.forEach(c => { this.collections[c.name] = this.db.collection(c.name) }) })
            } else {
                Array.isArray(this.collectionNames) && this.collectionNames.forEach(name => {
                    this.collections[name] = this.db.collection(name)
                })
            }
        })
        .catch(err => {
            this.logger.error({err})
            return Promise.resolve().delay(1000).then(() => { return this.initialize.apply(this) })
        })
    }

    _close (err: Error) {
        if (err instanceof MongoNetworkError) {
            this.logger.error({err}, `⛁ MongoDB database connection was interrupted. Try to re-connect`)
            return Promise.resolve().delay(1000).then(() => { return this.initialize.apply(this) })
        } else {
            this.logger.warn(`⛁ MongoDB database connection closed.`)
        }
    }

    /**
     * For every collections passed this function creates the collection if
     * it doesn't exist. To run createCollections function initialize function
     * should be run first
     *
     * @param  {Array} collections=[]
     *
     * @return Promise
     */
    createCollections ({ collections = [] } = {collections: []}) {
        return Promise.map(collections, collection => {
            return this.db.createCollection(collection)
        })
        .then(() => this.db.collections())
        .then(_collections => {
            this.collections = {}
            _.forEach(_.values(_collections), col => {
                this.collections[col.collectionName] = this.db.collection(col.collectionName)
            })
        })
    }

    get collectionsAvailable () {
        if (this.collections == null) return []
        if (this.collectionNames === 'all') return ['all']
        const cols: string[] = []
        Array.isArray(this.collectionNames) && this.collectionNames.forEach(collectionName => {
            cols.push(this.collections[collectionName].namespace)
        })
        return cols
    }

    shutDown () {
        if (this.client === undefined) return Promise.resolve()
        return this.client.close()
    }
}

export default Mongo
