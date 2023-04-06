import 'mocha'
import { assert } from 'chai'
import MongoDbPersistence, {ObjectID} from '../src/repositories/MongoDbPersistence'

describe('translateQuery', () => {
    it('should return empty object when given no query params', function () {
        const persistence = new MongoDbPersistence({ connectionString: '' })
        const result = persistence.translateQuery({})
        assert.deepStrictEqual(result, {})
    })

    it('should translate id to _id and convert to ObjectID when given a single value', function () {
        const persistence = new MongoDbPersistence({ connectionString: '' })
        const result = persistence.translateQuery({ id: '6153e3ab7bb12f520144731d' })
        assert.deepStrictEqual(result, { _id: ObjectID('6153e3ab7bb12f520144731d') })
    })

    it('should translate id to _id and convert to ObjectID when given an array of values', function () {
        const persistence = new MongoDbPersistence({ connectionString: '' })
        const result = persistence.translateQuery({ id: ['6153e3ab7bb12f520144732d', '6153e3ab7bb12f520144731d'] })
        assert.deepStrictEqual(result, { _id: { $in: [ObjectID('6153e3ab7bb12f520144732d'), ObjectID('6153e3ab7bb12f520144731d')] } })
    })

    it('should translate any other field to itself when given a single value', function () {
        const persistence = new MongoDbPersistence({ connectionString: '' })
        const result = persistence.translateQuery({ name: 'Alice' })
        assert.deepStrictEqual(result, { name: 'Alice' })
    })

    it('should translate any other field to itself when given an array of values', function () {
        const persistence = new MongoDbPersistence({ connectionString: '' })
        const result = persistence.translateQuery({ name: ['Alice', 'Bob'] })
        assert.deepStrictEqual(result, { name: { $in: ['Alice', 'Bob'] } })
    })

    it('should add a $text search operator when given a search parameter', function () {
        const persistence = new MongoDbPersistence({ connectionString: '' })
        const result = persistence.translateQuery({ name: 'Alice' }, 'Bob')
        assert.deepStrictEqual(result, { name: 'Alice', $text: { $search: 'Bob' } })
    })
})

describe('getPagination function', function () {
    it('should return the correct offset and limit when page and pageSize are 1 and 10, respectively', function () {
        const props = { page: 1, pageSize: 10 }
        const expected = { offset: 0, limit: 10 }
        const persistence = new MongoDbPersistence({ connectionString: '' })
        const result = persistence.getPagination(props)
        assert.deepEqual(result, expected)
    })

    it('should return the correct offset and limit when page is 2 and pageSize is 5', function () {
        const props = { page: 2, pageSize: 5 }
        const expected = { offset: 5, limit: 5 }
        const persistence = new MongoDbPersistence({ connectionString: '' })
        const result = persistence.getPagination(props)
        assert.deepEqual(result, expected)
    })

    it('should return the correct offset and limit when page is 10 and pageSize is 50', function () {
        const props = { page: 10, pageSize: 50 }
        const expected = { offset: 450, limit: 50 }
        const persistence = new MongoDbPersistence({ connectionString: '' })
        const result = persistence.getPagination(props)
        assert.deepEqual(result, expected)
    })
})
