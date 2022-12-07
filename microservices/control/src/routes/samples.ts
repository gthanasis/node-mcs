import {Router} from 'express'
import {SampleMsc} from '../service'
import {SampleController} from '../controllers/samples'
import {AsyncErrorHandler} from 'microservice'
import bodyValidator from '../middlewares/bodyValidator'
import {SampleJsonSchema} from '../models/Sample'
import paginationQueryParams from '../middlewares/paginationQueryParams'

export default (msc: SampleMsc): Router => {
    const router = Router()
    const controller = SampleController(msc)

    router.post('/samples',
        bodyValidator(SampleJsonSchema),
        AsyncErrorHandler(controller.post)
    )
    router.get('/samples/',
        paginationQueryParams(),
        AsyncErrorHandler(controller.get)
    )
    router.get('/samples/:sampleID',
        AsyncErrorHandler(controller.get)
    )
    router.patch('/samples/:sampleID',
        bodyValidator(SampleJsonSchema),
        AsyncErrorHandler(controller.patch)
    )
    router.delete('/samples/:sampleID',
        AsyncErrorHandler(controller.delete)
    )

    return router
}
