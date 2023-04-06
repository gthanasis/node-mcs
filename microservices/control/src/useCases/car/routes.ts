import express, {Router} from 'express'
import {ControlMsc} from '../../service'
import {CarService} from './service'
import {CarController} from './controler'
import {CarRepository} from './repository'
import {AsyncErrorHandler} from 'microservice'
import paginationOrderingQueryParams from '../../middlewares/paginationOrderingQueryParams'
const router = express.Router()

export default (msc: ControlMsc): Router => {
    const { persistence, logger } = msc
    const repository = new CarRepository({ persistence, logger })
    const service = new CarService({ repository, logger })
    const controller = new CarController({ service, logger })

    router.get('/cars/',
        paginationOrderingQueryParams(),
        AsyncErrorHandler(controller.getAll.bind(controller))
    )
    router.get('/cars/:carId', AsyncErrorHandler(controller.getById.bind(controller)))
    router.post('/cars/', AsyncErrorHandler(controller.post.bind(controller)))
    router.patch('/cars/:carId', AsyncErrorHandler(controller.patch.bind(controller)))
    router.delete('/cars/:carId', AsyncErrorHandler(controller.delete.bind(controller)))

    return router
}
