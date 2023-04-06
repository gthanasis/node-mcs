import { expect, assert } from 'chai'
import sinon from 'sinon'
import { __useCase__Service } from '../../src/useCases/__useCase__(lowerCase)/service'
import { __useCase__Repository } from '../../src/useCases/__useCase__(lowerCase)/repository'
import { BunyanLogger } from 'logger'
import { I__useCase__ } from 'project-types'

describe('__useCase__Service', () => {
    const __useCase__(lowerCase)Repository = new __useCase__Repository({
        persistence: {} as any,
        logger: {} as BunyanLogger
    })

    const logger = new BunyanLogger({
        name: 'test-logger',
        level: 'debug'
    })

    const __useCase__(lowerCase)Service = new __useCase__Service({repository: __useCase__(lowerCase)Repository, logger})

    describe('insert', () => {
        it('should insert a new __useCase__(lowerCase)', async () => {
            const payload = {name: 'New __useCase__', color: 'blue'}
            const stubInsert = sinon.stub(__useCase__(lowerCase)Repository, 'insert').returns(Promise.resolve(payload as I__useCase__))

            const result = await __useCase__(lowerCase)Service.insert(payload)

            assert.equal(stubInsert.calledOnce, true)

            // expect(stubInsert.calledOnce).to.be.true
            expect(result).to.be.an('object')
            expect(result).to.have.property('name', 'New __useCase__')
            expect(result).to.have.property('color', 'blue')

            stubInsert.restore()
        })
    })

    describe('retrieve', () => {
        it('should retrieve __useCases__(lowerCase) with filters', async () => {
            const query = {color: 'blue'}
            const pagination = {page: 1, pageSize: 10}
            const order = {order: '_id', direction: 'asc'}
            const search = 'sample'

            const expectedResult = {
                __useCases__(lowerCase): [{name: 'Sample __useCase__', color: 'red'}] as I__useCase__[],
                count: 1,
                pagination: {page: 1, pageSize: 10, filtered: 1}
            }

            const stubRetrieveWithFilter = sinon.stub(__useCase__(lowerCase)Repository, 'retrieveWithFilter').returns(Promise.resolve(expectedResult))

            const result = await __useCase__(lowerCase)Service.retrieve({query, pagination, order, search})

            expect(stubRetrieveWithFilter.calledOnceWith({query: query, pagination, order, search})).to.be.true
            expect(result).to.be.an('object')
            expect(result).to.have.property('__useCases__(lowerCase)').that.is.an('array')
            expect(result.__useCases__(lowerCase)[0]).to.have.property('name', 'Sample __useCase__')
            expect(result.__useCases__(lowerCase)[0]).to.have.property('color', 'red')
            expect(result).to.have.property('count', 1)
            expect(result).to.have.property('pagination').that.deep.equals(expectedResult.pagination)

            stubRetrieveWithFilter.restore()
        })
    })

    describe('update', () => {
        it('should update __useCases__(lowerCase) with filters', async () => {
            const filters = {name: 'Sample __useCase__'}
            const attrs = {color: 'blue'}

            const expectedResult = [{name: 'Sample __useCase__', color: 'blue'}] as I__useCase__[]

            const stubUpdate = sinon.stub(__useCase__(lowerCase)Repository, 'update').returns(Promise.resolve(expectedResult))

            const result = await __useCase__(lowerCase)Service.update({filters, attrs})

            expect(stubUpdate.calledOnce).to.be.true
            expect(result).to.be.an('array')
            expect(result[0]).to.have.property('name', 'Sample __useCase__')
            expect(result[0]).to.have.property('color', 'blue')

            stubUpdate.restore()
        })
    })
})
