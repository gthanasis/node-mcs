import Express from 'express'
import { __useCase__Service } from './service'
import {BunyanLogger} from 'logger'

export class __useCase__Controller {
    private readonly activity: { entity: string }
    private service: __useCase__Service
    private logger: BunyanLogger

    constructor ({ service, logger }: { service: __useCase__Service, logger: BunyanLogger }) {
        this.service = service
        this.logger = logger
        this.activity = {
            entity: '__useCases__(lowerCase)'
        }
    }

    async getAll (req: Express.Request, res: Express.Response, next: Express.NextFunction): Promise<void> {
        const { pageSize, page, search, order, orderDirection, ...restQuery } = req.query
        let searchTerms = null
        if (typeof search === 'string') searchTerms = search
        const ordering = { order: res.locals.orderField, direction: res.locals.orderDirection }
        const result = await this.service.retrieve({
            query: restQuery,
            pagination: { page: res.locals.page, pageSize: res.locals.pageSize },
            order: ordering,
            search: searchTerms
        })
        res.json({
            res: result.__useCases__(lowerCase),
            count: result.count,
            pagination: result.pagination,
            order: ordering
        })
        next()
    }

    async getById (req: Express.Request, res: Express.Response, next: Express.NextFunction): Promise<void> {
        const { __useCase__(lowerCase)Id } = req.params
        const result = await this.service.retrieve({
            query: { id: __useCase__(lowerCase)Id },
            pagination: { page: 1, pageSize: 1 },
            search: null,
            order: { direction: null, order: null }
        })
        res.json({ res: result.__useCases__(lowerCase) })
        next()
    }

    async post (req: Express.Request, res: Express.Response, next: Express.NextFunction): Promise<void> {
        const result = await this.service.insert(req.body)
        res.json({ res: result })
        res.locals.activity = { ...this.activity, action: 'create', data: { id: result.id } }
        next()
    }

    async patch (req: Express.Request, res: Express.Response, next: Express.NextFunction): Promise<void> {
        const { userId } = req.params
        const result = await this.service.update({
            filters: { id: userId },
            attrs: req.body
        })
        res.json({ res: result })
        res.locals.activity = { ...this.activity, action: 'update', data: { id: userId } }
        next()
    }

    async delete (req: Express.Request, res: Express.Response, next: Express.NextFunction): Promise<void> {
        const { userId } = req.params
        const result = await this.service.delete({ id: userId })
        res.json({ res: result })
        res.locals.activity = { ...this.activity, action: 'delete', data: { id: userId } }
        next()
    }
}
