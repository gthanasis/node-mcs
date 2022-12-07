import {ISample, ISampleDAO} from 'project-types'

const toDB = (props: Partial<ISample>): Partial<ISampleDAO> => {
    return {
        id: props.id,
        date: props.date,
        example_field: props.exampleField,
        name: props.name
    }
}
const toJSON = (props: Partial<ISampleDAO>): Partial<ISample> => {
    return {
        id: props.id,
        name: props.name,
        exampleField: props.example_field,
        date: props.date
    }
}

export { toDB, toJSON }
