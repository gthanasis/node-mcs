import Express from 'express'
import Ajv from 'ajv'
import {BadRequestError} from 'library'

// eslint-disable-next-line max-len
const bodyValidator = (schema: Record<string, unknown>) => async (req: Express.Request, res: Express.Response, next: Express.NextFunction): Promise<void> => {
    const ajv = new Ajv()
    const validate = ajv.compile(schema)
    const valid = validate(req.body)
    console.log(req.body)
    const errors = validate && validate.errors ? validate.errors.map(x => {
        const field = x.instancePath.split('/').filter(i => i !== '')
        return `${field.join(' > ')} ${x.message}`
    }) : []
    valid ? next() : next(new BadRequestError({ message: `Bad Request. ${errors.join(', ')}` }))
}

export default bodyValidator
