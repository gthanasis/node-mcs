import { Pool } from 'pg'
import IPersistence, {Order, Pagination, Query} from './IPersistence'
import Utils from './utlis'

type PgConstructorProps = {
    connectionString: string
}

class PostgreSqlPersistence implements IPersistence {
    private connectionString: any
    private pool: Pool

    constructor (props: PgConstructorProps) {
        const { connectionString } = props
        this.connectionString = connectionString
        this.pool = new Pool({ connectionString })
    }

    // Find one by primary _id
    async find<T> (id: string, table: string): Promise<T | null> {
        const query = {
            text: `SELECT * FROM ${table} WHERE id=$1 LIMIT 1`,
            values: [id]
        }
        // console.log(`Find query`, query)
        const res = await this.pool.query(query)
        // console.log(`Find response`, res)
        return res.rows[0]
    }

    // Find one by query
    async findBy<T> (where: Query, table): Promise<T | null> {
        let whereClause = ``
        const whereValues: string[] = []

        for (const predicate in where) {
            whereClause += `${predicate}=$${whereValues.length + 1}`
            whereValues.push(where[predicate])
        }

        const query = {
            text: `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`,
            values: whereValues
        }

        // console.log(`FindBy query`, query)
        const res = await this.pool.query(query)
        // console.log(`FindBy response`, res)
        return res.rows
    }

    // Find all by query
    // [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3 }]
    async findAll<T> (where: Query[], table: string, order?: Order, pagination?: Pagination, search?: string): Promise<T[]> {
        const normalizedQuery = Utils.normalizeQuery(where)
        const normalizedQueryOr: Record<string, string> = {}

        for (const key in normalizedQuery) {
            normalizedQueryOr[key] = normalizedQuery[key].join(',')
        }

        const whereClause: string[] = []
        const whereValues: string[] = []

        let count = 0

        for (const predicate in normalizedQueryOr) {
            const notNullValues = normalizedQuery[predicate].filter(value => value !== 'null')
            const nullValues = normalizedQuery[predicate].filter(value => value === 'null')

            if (notNullValues.length > 0) {
                // Build where in query
                whereClause.push(`${predicate} IN (${notNullValues.map((value, index) => `$${count + index + 1}`)})`)
                count += notNullValues.length
                notNullValues.forEach((value) => whereValues.push(value))
            }

            if (nullValues.length > 0) whereClause.push(`${predicate} IS NULL`)
        }

        let qText = `SELECT * FROM ${table}`

        if (search) {
            whereClause.push(` (name ILIKE '%${search}%') `)
        }

        if (whereClause.length > 0) qText += ` WHERE ${whereClause.join(' AND ')}`

        if (order) qText += ` ORDER BY ${order.field}${order.cast ? `::${order.cast}` : ''} ${order.direction}`
        if (pagination) qText += ` LIMIT ${pagination.limit} OFFSET ${pagination.offset}`

        const query = { text: qText, values: whereValues }

        // console.log(`FindAll query`, query)
        const res = await this.pool.query(query)
        // console.log(`FindAll response`, res)
        return res.rows
    }

    async count (where: Query[], table: string, order?: Order, pagination?: Pagination): Promise<number> {
        const normalizedQuery = Utils.normalizeQuery(where)
        const normalizedQueryOr: Record<string, string> = {}

        for (const key in normalizedQuery) {
            normalizedQueryOr[key] = normalizedQuery[key].join(',')
        }

        const whereClause: string[] = []
        const whereValues: string[] = []

        let count = 0

        for (const predicate in normalizedQueryOr) {
            const notNullValues = normalizedQuery[predicate].filter(value => value !== 'null')
            const nullValues = normalizedQuery[predicate].filter(value => value === 'null')

            if (notNullValues.length > 0) {
                // Build where in query
                whereClause.push(`${predicate} IN (${notNullValues.map((value, index) => `$${count + index + 1}`)})`)
                count += notNullValues.length
                notNullValues.forEach((value) => whereValues.push(value))
            }

            if (nullValues.length > 0) whereClause.push(`${predicate} IS NULL`)
        }

        let qText = `SELECT COUNT(*) FROM ${table}`
        if (whereClause.length > 0) qText += ` WHERE ${whereClause.join(' AND ')}`
        if (pagination) qText += ` LIMIT ${pagination.limit} OFFSET ${pagination.offset}`

        const query = { text: qText, values: whereValues }
        // console.log(`count query`, query)

        const res = await this.pool.query(query)
        return res.rows[0].count
    }

    async create<T> (modelInstances: any | any[], table: string): Promise<T> {
        const attributes = Object.keys(modelInstances).filter(a => modelInstances[a] !== undefined)
        const statements = attributes.map((v: any, index: number) => `$${index + 1}`)
        const values = attributes.map((v: any) => modelInstances[v])

        const query = {
            text: `INSERT INTO ${table}(${attributes.join(', ')}) values(${statements.join(', ')}) RETURNING *`,
            values: values
        }

        // console.log(`Create query`, query)
        const res = await this.pool.query(query)
        if (res.rows.length < 1) throw new Error(`Could not create model, ${JSON.stringify(modelInstances)}`)
        // console.log(`Create response`, res)

        return res.rows[0]
    }

    async update<T> (attributes: any, where: Query, table: string): Promise<T[]> {
        const whereClause: string[] = []
        const whereValues: string[] = []

        for (const predicate in where) {
            if (where[predicate] != null) {
                whereClause.push(`${predicate}=$${whereValues.length + 1}`)
                whereValues.push(where[predicate])
            }
        }

        const attrs = Object.keys(attributes).filter(a => attributes[a] !== undefined)
        const statements = attrs.map((v: any, index: number) => `${v}=$${whereValues.length + index + 1}`)
        const values = attrs.map((v: any) => attributes[v])

        let qText = `UPDATE ${table} SET ${statements.join(', ')} `
        if (whereClause.length > 0) qText += ` WHERE ${whereClause.join(' AND ')}`
        qText += ` RETURNING *`

        const query = {
            text: qText,
            values: whereValues.concat(values)
        }

        // console.log(`Update query`, query)
        const res = await this.pool.query(query)
        // console.log(`Update response`, res)
        if (res.rowCount < 1) throw new Error(`Did not update row(s)`)
        return res.rows
    }

    async replace<T> (attributes: any, where: Query): Promise<T | null> {
        return await this.pool.query(``)
    }

    async directQuery<T> (text: string, values: string[]): Promise<T[]> {
        // console.log({ text, values })
        const res = await this.pool.query({ text, values })
        return res.rows
    }

    async delete<T> (where: Query, table: string): Promise<T[]> {
        // { name: 'test', sur: 'test2' }
        let whereClause = ``
        const whereValues: string[] = []

        for (const predicate in where) {
            whereClause += `${predicate}=$${whereValues.length + 1}`
            whereValues.push(where[predicate])
        }

        const query = {
            text: `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`,
            values: whereValues
        }

        // console.log(`Delete query`, query)
        const res = await this.pool.query(query)
        // console.log(`Delete response`, query)
        return res.rows
    }

    transformIdField (id: string): any {
        return id
    }

    async connect () {
        return Promise.resolve()
    }

    async disconnect () {
        return this.pool.end()
    }
}

export default PostgreSqlPersistence
