import {WithID, WithLodashID} from './generics'

export interface ICar {
    id: string
    name: string
    color: string
    createdAt: string
    updatedAt: string | null
    deletedAt: string | null
}

export interface ISampleDAO {
    _id?: string
    name: string
    date: string
    exampleField: string
}

export { WithID, WithLodashID }
