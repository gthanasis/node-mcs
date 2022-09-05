import Microservice from 'microservice'
import {Router} from 'express'
import {SampleController} from './controllers/sample'

export default (msc: Microservice): Router => {
    const router = Router()
    const controller = SampleController(msc)

    router.post('/sample', controller.post)

    return router
}
