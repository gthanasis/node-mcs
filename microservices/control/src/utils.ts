type PaginationDB = {
    limit: number
    offset: number
}

type PageParams = {
    pageSize: string,
    page: string
}

export type Pagination = {
    pageSize: string
    page: string
}

export default {
    generatePagination: (pageParams: PageParams | undefined): PaginationDB | undefined => {
        let pagination
        if (pageParams) {
            pagination = {
                limit: parseInt(pageParams.pageSize),
                offset: (parseInt(pageParams.page)) * parseInt(pageParams.pageSize)
            }
        }
        return pagination
    },
    databaseColFromTransformer: (transformer: (e: Record<string, unknown>) => Record<string, unknown>, key: string | undefined, defaultKey = 'id'): string => {
        if (key === undefined) return defaultKey
        let col: string = defaultKey
        const obj = transformer({ [key]: 0 })
        Object.keys(obj).forEach((k) => {
            if (obj[k] === 0) col = k
        })
        return col
    }
}
