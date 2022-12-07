import {Query} from './IPersistence'

export default {
    normalizeQuery: (predicateList: Query[]): Record<string, string[]> => {
        const queryKeySet = new Set(
            predicateList
            .flatMap((predicate) => {
                return Object.keys(predicate)
                .filter((predicateKey) => predicate[predicateKey] !== undefined)
            })
        )

        const results: Record<string, string[]> = {}
        queryKeySet.forEach((key: string) => {
            predicateList.forEach((predicate: Query) => {
                if (predicate[key]) { // value is not undefined
                    if (!results.hasOwnProperty(key)) { // key exists in results
                        results[key] = [predicate[key]]
                    } else {
                        if (results[key].indexOf(predicate[key]) === -1) results[key].push(predicate[key])
                    }
                }
            })
        })
        return results
    }
}
