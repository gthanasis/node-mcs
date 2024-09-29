import express, {Router} from 'express'
import {StorageMsc} from '../../service'
import {AsyncErrorHandler} from 'microservice'
import {ImagesController} from './controler'
import {generateImagesService} from './index'
import bodyValidator from '../../middlewares/bodyValidator'
import ImageJsonSchema from './model'
import multer from 'multer'
const router = express.Router()

export default (msc: StorageMsc): Router => {
    const { logger } = msc
    const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }) // Set a file size limit, e.g., 10MB
    const imagesService = generateImagesService(msc)
    const controller = new ImagesController({ service: imagesService, logger })
    router.get('/workspaces/:workspaceId/images/:imageId', AsyncErrorHandler(controller.getById.bind(controller)))
    router.post('/workspaces/:workspaceId/images/',
        upload.single('buffer'),
        bodyValidator(ImageJsonSchema),
        AsyncErrorHandler(controller.post.bind(controller))
    )
    router.delete('/workspaces/:workspaceId/images/:imageId', AsyncErrorHandler(controller.delete.bind(controller)))
    return router
}
