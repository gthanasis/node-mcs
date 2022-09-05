import 'mocha'
import { assert } from 'chai'

import Sample from '../src/models/sample'

describe('Sample model', () => {
    it('Should return the example field', done => {
        assert.deepEqual(Sample('test'), { exampleField: 'test' })
        done()
    })
})
