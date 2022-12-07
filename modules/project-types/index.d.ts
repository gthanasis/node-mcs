import {WithID} from './generics'

export interface ISample {
    id?: string
    name: string
    date: string
    exampleField: string
}

export interface ISampleDAO {
    id?: string
    name: string
    date: string
    example_field: string
}

export { WithID }
