import { expect, assert } from 'chai'
import sinon from 'sinon'
import { CarService } from '../../src/useCases/car/service'
import { CarRepository } from '../../src/useCases/car/repository'
import { BunyanLogger } from 'logger'
import { ICar } from 'project-types'

describe('CarService', () => {
    const carRepository = new CarRepository({
        persistence: {} as any,
        logger: {} as BunyanLogger
    })

    const logger = new BunyanLogger({
        name: 'test-logger',
        level: 'debug'
    })

    const carService = new CarService({repository: carRepository, logger})

    describe('insert', () => {
        it('should insert a new car', async () => {
            const payload = {name: 'New Car', color: 'blue'}
            const stubInsert = sinon.stub(carRepository, 'insert').returns(Promise.resolve(payload as ICar))

            const result = await carService.insert(payload)

            assert.equal(stubInsert.calledOnce, true)

            // expect(stubInsert.calledOnce).to.be.true
            expect(result).to.be.an('object')
            expect(result).to.have.property('name', 'New Car')
            expect(result).to.have.property('color', 'blue')

            stubInsert.restore()
        })
    })

    describe('retrieve', () => {
        it('should retrieve cars with filters', async () => {
            const query = {color: 'blue'}
            const pagination = {page: 1, pageSize: 10}
            const order = {order: '_id', direction: 'asc'}
            const search = 'sample'

            const expectedResult = {
                cars: [{name: 'Sample Car', color: 'red'}] as ICar[],
                count: 1,
                pagination: {page: 1, pageSize: 10, filtered: 1}
            }

            const stubRetrieveWithFilter = sinon.stub(carRepository, 'retrieveWithFilter').returns(Promise.resolve(expectedResult))

            const result = await carService.retrieve({query, pagination, order, search})

            expect(stubRetrieveWithFilter.calledOnceWith({query: query, pagination, order, search})).to.be.true
            expect(result).to.be.an('object')
            expect(result).to.have.property('cars').that.is.an('array')
            expect(result.cars[0]).to.have.property('name', 'Sample Car')
            expect(result.cars[0]).to.have.property('color', 'red')
            expect(result).to.have.property('count', 1)
            expect(result).to.have.property('pagination').that.deep.equals(expectedResult.pagination)

            stubRetrieveWithFilter.restore()
        })
    })

    describe('update', () => {
        it('should update cars with filters', async () => {
            const filters = {name: 'Sample Car'}
            const attrs = {color: 'blue'}

            const expectedResult = [{name: 'Sample Car', color: 'blue'}] as ICar[]

            const stubUpdate = sinon.stub(carRepository, 'update').returns(Promise.resolve(expectedResult))

            const result = await carService.update({filters, attrs})

            expect(stubUpdate.calledOnce).to.be.true
            expect(result).to.be.an('array')
            expect(result[0]).to.have.property('name', 'Sample Car')
            expect(result[0]).to.have.property('color', 'blue')

            stubUpdate.restore()
        })
    })
})
