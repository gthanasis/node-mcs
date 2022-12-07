import {BadRequestError} from 'library'
import {ISample} from 'project-types'

const Sample = (props: Partial<ISample>): ISample => {
    if (undefined === props.name) throw new BadRequestError({ message: `name should be set` })
    if (undefined === props.exampleField) throw new BadRequestError({ message: `exampleField should be set` })
    if (undefined === props.date) throw new BadRequestError({ message: `date should be set` })

    return {
        date: props.date,
        exampleField: props.exampleField,
        name: props.name
    }
}

const SampleJsonSchema = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        exampleField: { type: 'string' },
        date: { type: 'string' }
    },
    additionalProperties: false
}

export default Sample
export { SampleJsonSchema }
