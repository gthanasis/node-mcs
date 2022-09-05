import Microservice from 'microservice'
import Express from 'express'
import SampleService from '../services/sample'

const SampleController = (msc: Microservice) => {
    const service = new SampleService(msc)

    return {
        post: async (req: Express.Request, res: Express.Response): Promise<void> => {
            const e = await service.create({ name: req.body.name })
            res.json({ result: e })
        }
    }
}

export { SampleController }
