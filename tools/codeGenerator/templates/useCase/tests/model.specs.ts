import { assert } from 'chai'
import { __useCase__ } from '../../src/useCases/__useCase__(lowerCase)/model'
import { BadRequestError } from 'library'

describe('__useCase__', () => {
    describe('validate', () => {
        it('should throw BadRequestError if color is \'invalidColor\'', () => {
            const __useCase__(lowerCase) = { name: 'Sample __useCase__', color: 'invalidColor' }
            assert.throw(() => __useCase__(__useCase__(lowerCase)), BadRequestError)
        })

        it('should not throw if color is not \'invalidColor\'', () => {
            const __useCase__(lowerCase) = { name: 'Sample __useCase__', color: 'red' }
            assert.doesNotThrow(() => __useCase__(__useCase__(lowerCase)), BadRequestError)
        })
    })

    describe('__useCase__', () => {
        it('should return a __useCase__(lowerCase) with default values', () => {
            const __useCase__(lowerCase) = __useCase__({})
            assert.exists(__useCase__(lowerCase).name)
            assert.exists(__useCase__(lowerCase).color)
            assert.exists(__useCase__(lowerCase).createdAt)
            assert.notExists(__useCase__(lowerCase).deletedAt)
            assert.notExists(__useCase__(lowerCase).updatedAt)
        })

        it('should return a __useCase__(lowerCase) with provided name and color', () => {
            const __useCase__(lowerCase) = __useCase__({ name: 'Sample __useCase__', color: 'green' })
            assert.equal(__useCase__(lowerCase).name, 'Sample __useCase__')
            assert.equal(__useCase__(lowerCase).color, 'green')
        })

        it('should set createdAt as current time', () => {
            const __useCase__(lowerCase) = __useCase__({})
            const now = new Date()
            assert.equal(__useCase__(lowerCase).createdAt, now.toISOString())
        })
    })
})
