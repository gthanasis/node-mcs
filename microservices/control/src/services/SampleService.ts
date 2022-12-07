import Sample from '../models/Sample'
import {ISample as IEntity, ISampleDAO as IEntityDAO} from 'project-types'
import {IPersistence, ResourceExistsError, ResourceNotFoundError} from 'library'
import {BunyanLogger} from 'logger'
import {toJSON, toDB} from '../transformers/Sample'
import Utils, {Pagination} from '../utils'

export default class SampleService {
    private persistence: IPersistence
    private logger: BunyanLogger
    private persitenceScope: string

    constructor (persistence: IPersistence, logger: BunyanLogger) {
        this.persistence = persistence
        this.logger = logger
        this.persitenceScope = 'samples'
    }

    async create (props: Partial<IEntity>): Promise<Partial<IEntity>> {
        const recruit = toDB(Sample(props))
        try {
            const res = await this.persistence.create<IEntityDAO>(recruit, this.persitenceScope)
            return toJSON(res)
        } catch (e: any) {
            if (e.code === '23505') throw new ResourceExistsError({ original: e })
            throw new Error(e)
        }
    }

    async get (id: string): Promise<Partial<IEntity> | undefined> {
        const res = await this.persistence.find<IEntityDAO>(id, this.persitenceScope)
        if (res === null) throw new ResourceNotFoundError()
        return toJSON(res)
    }

    async getAll (query: Partial<IEntity>[], pagination?: Pagination, search?: string, orderBy?: string, orderDir?: string): Promise<Partial<IEntity>[]> {
        const res = await this.persistence.findAll<IEntityDAO>(
            query.map(toDB),
            this.persitenceScope,
            { field: Utils.databaseColFromTransformer(toDB, orderBy, 'id'), direction: orderDir || 'desc' },
            Utils.generatePagination(pagination),
            search
        )
        return res.map(toJSON)
    }

    async count (query: Partial<IEntity>[], pagination?: Pagination): Promise<number> {
        const res = await this.persistence.count(
            query.map(toDB),
            this.persitenceScope,
            undefined,
            Utils.generatePagination(pagination)
        )
        return res
    }

    async update (id: string, attributes: Partial<IEntity>): Promise<Partial<IEntity>[]> {
        await this.get(id)
        const attrs = toDB(attributes)
        const res = await this.persistence.update<IEntityDAO>(attrs, {id}, this.persitenceScope)
        return res.map(toJSON)
    }

    async delete (id: string): Promise<Partial<IEntity>> {
        await this.get(id)
        const res = await this.persistence.delete<IEntityDAO>({id}, this.persitenceScope)
        return toJSON(res[0])
    }
}
