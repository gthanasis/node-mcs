import { assert } from 'chai'
import { Car } from '../../src/useCases/car/model'
import { BadRequestError } from 'library'

describe('Car', () => {
    describe('validate', () => {
        it('should throw BadRequestError if color is \'invalidColor\'', () => {
            const car = { name: 'Sample Car', color: 'invalidColor' }
            assert.throw(() => Car(car), BadRequestError)
        })

        it('should not throw if color is not \'invalidColor\'', () => {
            const car = { name: 'Sample Car', color: 'red' }
            assert.doesNotThrow(() => Car(car), BadRequestError)
        })
    })

    describe('Car', () => {
        it('should return a car with default values', () => {
            const car = Car({})
            assert.exists(car.name)
            assert.exists(car.color)
            assert.exists(car.createdAt)
            assert.notExists(car.deletedAt)
            assert.notExists(car.updatedAt)
        })

        it('should return a car with provided name and color', () => {
            const car = Car({ name: 'Sample Car', color: 'green' })
            assert.equal(car.name, 'Sample Car')
            assert.equal(car.color, 'green')
        })

        it('should set createdAt as current time', () => {
            const car = Car({})
            const now = new Date()
            assert.equal(car.createdAt, now.toISOString())
        })
    })
})
