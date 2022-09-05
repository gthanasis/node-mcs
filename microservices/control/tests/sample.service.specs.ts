import 'mocha'
import { assert } from 'chai'

import Microservice from 'microservice'
import SampleService from '../src/services/sample'

describe('Sample model service', () => {
    it('Should return a sample with the correct data', done => {
        const Service = new SampleService({} as Microservice)
        assert.deepEqual(Service.create({name: 'test'}), { exampleField: 'test' })
        done()
    })
})
