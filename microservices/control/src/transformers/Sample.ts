import {ISample, ISampleDAO} from 'project-types'

const toDB = (props: Partial<ISample>): Partial<ISampleDAO> => {
    return {
        _id: props.id,
        date: props.date,
        exampleField: props.exampleField,
        name: props.name
    }
}
const toJSON = (props: Partial<ISampleDAO>): Partial<ISample> => {
    return {
        id: props._id,
        name: props.name,
        exampleField: props.exampleField,
        date: props.date
    }
}

export { toDB, toJSON }
