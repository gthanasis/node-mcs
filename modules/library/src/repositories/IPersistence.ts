export interface Query {
    [attribute: string]: any
}

export interface Pagination {
    limit: number
    offset: number
}

export interface Order {
    field: string
    direction: string
    cast?: string
}

export default interface IPersistence {
    find<T> (id: string | number, table: string): Promise<T>
    findBy<T> (where: Query, table: string): Promise<T>
    findAll<T> (where: Query[], table: string, order?: Order, pagination?: Pagination, search?: string): Promise<T[]>
    create<T> (modelInstances: any | any[], table: string): Promise<T>
    update<T> (attributes: Record<string, string>, where: Query, table: string): Promise<T[]>
    replace<T> (attributes: any, where: Query, table: string): Promise<T | null>
    delete<T> (where: Query, table: string): Promise<T[]>

    count (where: Query[], table: string, order?: Order, pagination?: Pagination): Promise<number>

    connect (): Promise<void>
    disconnect (): Promise<void>

    directQuery <T> (text: string, values: string[]): Promise<T[]>

    transformIdField(id: string): any
}
