import {SampleMsc} from '../service'
import Express from 'express'
import SampleService from '../services/SampleService'
import {IPersistence} from 'library'
import {BunyanLogger} from 'logger'

const SampleController = (msc: SampleMsc): Record<string, unknown> => {
    const persistence: IPersistence = msc.persistence
    const logger: BunyanLogger = msc.logger
    const service = new SampleService(persistence, logger)

    return {
        post: async (req: Express.Request, res: Express.Response): Promise<void> => {
            const { name, date, exampleField } = req.body
            const sample = await service.create({ name, date, exampleField })
            res.json({ results: [sample] })
        },
        get: async (req: Express.Request, res: Express.Response): Promise<void> => {
            const { sampleID } = req.params
            const { search, orderBy, orderDir } = req.query
            const pagination = { pageSize: res.locals.pageSize, page: res.locals.page }

            const query: Record<string, string> = {}
            if (sampleID) query['id'] = Array.isArray(sampleID) ? sampleID[0] as string : sampleID as string

            const e = sampleID ? await service.get(sampleID) : await service.getAll([query], pagination, search as string, orderBy as string, orderDir as string)
            res.json({ results: e, count: await service.count([query]) })
        },
        patch: async (req: Express.Request, res: Express.Response): Promise<void> => {
            const { sampleID } = req.params
            const attributes = req.body
            const query: Record<string, string> = {}
            if (sampleID) query['id'] = Array.isArray(sampleID) ? sampleID[0] as string : sampleID as string
            const e = await service.update(sampleID as string, attributes)
            res.json({ results: e })
        },
        delete: async (req: Express.Request, res: Express.Response): Promise<void> => {
            const { sampleID } = req.params
            const e = await service.delete(sampleID as string)
            res.json({ results: e })
        }
    }
}

export { SampleController }
