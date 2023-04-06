import express, {Router} from 'express'
import {ControlMsc} from '../../service'
import {__useCase__Service} from './service'
import {__useCase__Controller} from './controler'
import {__useCase__Repository} from './repository'
import {AsyncErrorHandler} from 'microservice'
import paginationOrderingQueryParams from '../../middlewares/paginationOrderingQueryParams'
const router = express.Router()

export default (msc: ControlMsc): Router => {
    const { persistence, logger } = msc
    const repository = new __useCase__Repository({ persistence, logger })
    const service = new __useCase__Service({ repository, logger })
    const controller = new __useCase__Controller({ service, logger })

    router.get('/__useCases__(lowerCase)/',
        paginationOrderingQueryParams(),
        AsyncErrorHandler(controller.getAll.bind(controller))
    )
    router.get('/__useCases__(lowerCase)/:__useCase__(lowerCase)Id', AsyncErrorHandler(controller.getById.bind(controller)))
    router.post('/__useCases__(lowerCase)/', AsyncErrorHandler(controller.post.bind(controller)))
    router.patch('/__useCases__(lowerCase)/:__useCase__(lowerCase)Id', AsyncErrorHandler(controller.patch.bind(controller)))
    router.delete('/__useCases__(lowerCase)/:__useCase__(lowerCase)Id', AsyncErrorHandler(controller.delete.bind(controller)))

    return router
}
