import Express from 'express'
import {BadRequestError} from 'library'

// eslint-disable-next-line max-len
const paginationQueryParams = () => async (req: Express.Request, res: Express.Response, next: Express.NextFunction): Promise<void> => {
    res.locals.pageSize = req.query.pageSize || 50
    res.locals.page = req.query.page || 0
    if (res.locals.pageSize <= 0) next(new BadRequestError({ message: `pageSize should be larger than 0` }))
    if (res.locals.page < 0) next(new BadRequestError({ message: `page should be larger or equal than 0` }))
    next()
}

export default paginationQueryParams
