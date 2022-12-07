import {WithID} from './generics'

export interface ISample {
    id?: string
    name: string
    date: string
    exampleField: string
}

export interface ISampleDAO {
    _id?: string
    name: string
    date: string
    exampleField: string
}

export { WithID }
