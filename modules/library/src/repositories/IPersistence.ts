export interface Query {
    [attribute: string]: any
}

export default interface IPersistence {
    find<T> (id: string): Promise<T>
    findBy<T> (where: Query): Promise<T>
    findAll<T> (where: Query): Promise<T>
    create<T> (modelInstances: any | any[]): Promise<T[]>
    update<T> (attributes: {}, where: Query): Promise<T[]>
    replace<T> (attributes: any, where: Query): Promise<T | null>
    destroy<T> (where: Query): Promise<T[]>

    transformIdField(id: string): any
}
